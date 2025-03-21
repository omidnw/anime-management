use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;
use once_cell::sync::Lazy;

static DB_CONNECTION: Lazy<Mutex<Connection>> = Lazy::new(|| {
    Mutex::new(initialize_db().expect("Failed to initialize database"))
});

#[derive(Debug, Serialize, Deserialize)]
pub struct UserAnime {
    pub id: Option<i64>,
    pub anime_id: i64,
    pub status: String,
    pub score: i64,
    pub progress: i64,
    pub notes: String,
    pub favorite: bool,
    pub start_date: Option<String>,
    pub end_date: Option<String>,
    pub image_url: String,
    pub title: String,
}

// For simplicity, use a fixed path for the database during development
// In a production app, we would get this from the app_handle in a setup hook
fn get_db_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| {
        if cfg!(windows) {
            std::env::var("USERPROFILE").unwrap_or_else(|_| ".".to_string())
        } else {
            ".".to_string()
        }
    });
    
    let app_data_dir = PathBuf::from(home).join(".anitrack");
    
    // Create directory if it doesn't exist
    fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");
    
    app_data_dir.join("anime_database.db")
}

fn initialize_db() -> Result<Connection> {
    let db_path = get_db_path();
    let conn = Connection::open(db_path)?;
    
    // Check if the user_anime table exists
    let table_exists: bool = conn.query_row(
        "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='user_anime')",
        [],
        |row| row.get(0),
    ).unwrap_or(false);
    
    if !table_exists {
        // Create the table if it doesn't exist
        conn.execute(
            "CREATE TABLE user_anime (
                id INTEGER PRIMARY KEY,
                anime_id INTEGER NOT NULL,
                status TEXT NOT NULL,
                score INTEGER NOT NULL,
                progress INTEGER NOT NULL,
                notes TEXT NOT NULL,
                favorite BOOLEAN NOT NULL,
                start_date TEXT,
                end_date TEXT,
                image_url TEXT NOT NULL DEFAULT '',
                title TEXT NOT NULL DEFAULT '',
                UNIQUE(anime_id)
            )",
            [],
        )?;
    } else {
        // Check if we need to add the new columns to an existing table
        let columns = conn.prepare("PRAGMA table_info(user_anime)")?
            .query_map([], |row| {
                Ok(row.get::<_, String>(1)?)
            })?
            .collect::<Result<Vec<String>>>()?;
        
        if !columns.contains(&"image_url".to_string()) {
            conn.execute("ALTER TABLE user_anime ADD COLUMN image_url TEXT NOT NULL DEFAULT ''", [])?;
        }
        
        if !columns.contains(&"title".to_string()) {
            conn.execute("ALTER TABLE user_anime ADD COLUMN title TEXT NOT NULL DEFAULT ''", [])?;
        }
    }
    
    Ok(conn)
}

#[tauri::command]
pub fn add_user_anime(anime: UserAnime) -> Result<UserAnime, String> {
    let conn = DB_CONNECTION.lock().unwrap();
    
    match conn.execute(
        "INSERT INTO user_anime (anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
         ON CONFLICT(anime_id) DO UPDATE SET
         status = ?2, score = ?3, progress = ?4, notes = ?5, favorite = ?6, start_date = ?7, end_date = ?8, image_url = ?9, title = ?10",
        params![
            anime.anime_id,
            anime.status,
            anime.score,
            anime.progress,
            anime.notes,
            anime.favorite,
            anime.start_date,
            anime.end_date,
            anime.image_url,
            anime.title,
        ],
    ) {
        Ok(_) => {
            match conn.query_row(
                "SELECT id, anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title
                 FROM user_anime WHERE anime_id = ?1",
                params![anime.anime_id],
                |row| {
                    Ok(UserAnime {
                        id: Some(row.get(0)?),
                        anime_id: row.get(1)?,
                        status: row.get(2)?,
                        score: row.get(3)?,
                        progress: row.get(4)?,
                        notes: row.get(5)?,
                        favorite: row.get(6)?,
                        start_date: row.get(7)?,
                        end_date: row.get(8)?,
                        image_url: row.get(9)?,
                        title: row.get(10)?,
                    })
                },
            ) {
                Ok(user_anime) => Ok(user_anime),
                Err(err) => Err(format!("Failed to retrieve updated anime: {}", err)),
            }
        }
        Err(err) => Err(format!("Failed to add anime: {}", err)),
    }
}

#[tauri::command]
pub fn get_user_anime(anime_id: i64) -> Result<Option<UserAnime>, String> {
    let conn = DB_CONNECTION.lock().unwrap();
    
    match conn.query_row(
        "SELECT id, anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title
         FROM user_anime WHERE anime_id = ?1",
        params![anime_id],
        |row| {
            Ok(UserAnime {
                id: Some(row.get(0)?),
                anime_id: row.get(1)?,
                status: row.get(2)?,
                score: row.get(3)?,
                progress: row.get(4)?,
                notes: row.get(5)?,
                favorite: row.get(6)?,
                start_date: row.get(7)?,
                end_date: row.get(8)?,
                image_url: row.get(9)?,
                title: row.get(10)?,
            })
        },
    ) {
        Ok(user_anime) => Ok(Some(user_anime)),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(err) => Err(format!("Failed to get anime: {}", err)),
    }
}

#[tauri::command]
pub fn list_user_anime(status: Option<String>) -> Result<Vec<UserAnime>, String> {
    let conn = DB_CONNECTION.lock().unwrap();
    
    // Add debugging log for status parameter
    println!("Filtering anime list with status: {:?}", status);
    
    let sql = match status {
        Some(_) => "SELECT id, anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title 
                  FROM user_anime WHERE status = ?1 ORDER BY id DESC",
        None => "SELECT id, anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title 
               FROM user_anime ORDER BY id DESC",
    };
    
    let mut stmt = conn
        .prepare(sql)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    
    let mut user_anime_list = Vec::new();
    
    // Use a common function to create the UserAnime from a row
    fn map_row(row: &rusqlite::Row) -> rusqlite::Result<UserAnime> {
        Ok(UserAnime {
            id: Some(row.get(0)?),
            anime_id: row.get(1)?,
            status: row.get(2)?,
            score: row.get(3)?,
            progress: row.get(4)?,
            notes: row.get(5)?,
            favorite: row.get(6)?,
            start_date: row.get(7)?,
            end_date: row.get(8)?,
            image_url: row.get(9)?,
            title: row.get(10)?,
        })
    }
    
    let rows = match status {
        Some(s) => {
            println!("Executing query with status: {}", s);
            stmt
                .query_map(params![s], map_row)
                .map_err(|e| format!("Failed to execute query: {}", e))?
        },
        None => {
            println!("Executing query without status filter");
            stmt
                .query_map([], map_row)
                .map_err(|e| format!("Failed to execute query: {}", e))?
        },
    };
    
    for user_anime in rows {
        user_anime_list.push(user_anime.map_err(|e| format!("Failed to retrieve row: {}", e))?);
    }
    
    println!("Found {} anime in list", user_anime_list.len());
    Ok(user_anime_list)
}

#[tauri::command]
pub fn delete_user_anime(anime_id: i64) -> Result<bool, String> {
    let conn = DB_CONNECTION.lock().unwrap();
    
    // First check if the anime exists
    let exists = match conn.query_row(
        "SELECT 1 FROM user_anime WHERE anime_id = ?1 LIMIT 1",
        params![anime_id],
        |_| Ok(true)
    ) {
        Ok(_) => true,
        Err(rusqlite::Error::QueryReturnedNoRows) => false,
        Err(err) => return Err(format!("Failed to check if anime exists: {}", err)),
    };
    
    // If anime doesn't exist, return success with false (nothing to delete)
    if !exists {
        return Ok(false);
    }
    
    // Delete the anime
    match conn.execute("DELETE FROM user_anime WHERE anime_id = ?1", params![anime_id]) {
        Ok(rows) => {
            if rows > 0 {
                Ok(true)
            } else {
                // This should rarely happen since we checked existence
                Ok(false)
            }
        },
        Err(err) => Err(format!("Failed to delete anime: {}", err)),
    }
} 