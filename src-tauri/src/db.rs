use once_cell::sync::Lazy;
use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

static DB_CONNECTION: Lazy<Mutex<Connection>> =
    Lazy::new(|| Mutex::new(initialize_db().expect("Failed to initialize database")));

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

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportData {
    pub version: String,
    pub timestamp: String,
    pub metadata: ExportMetadata,
    pub anime_list: Vec<UserAnime>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportMetadata {
    pub app_version: String,
    pub os: String,
    pub device_name: String,
    pub export_type: String, // Full, Watching, Completed, etc.
    pub entry_count: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExportResponse {
    pub path: String,
    pub entry_count: usize,
    pub export_type: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportOptions {
    pub import_path: String,
    pub merge_strategy: String,      // "merge", "replace", "skip_existing"
    pub conflict_resolution: String, // "keep_existing", "use_imported", "keep_newer"
    pub import_type: String,         // "all", "watching", "completed", etc.
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
    let table_exists: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='user_anime')",
            [],
            |row| row.get(0),
        )
        .unwrap_or(false);

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
        let columns = conn
            .prepare("PRAGMA table_info(user_anime)")?
            .query_map([], |row| Ok(row.get::<_, String>(1)?))?
            .collect::<Result<Vec<String>>>()?;

        if !columns.contains(&"image_url".to_string()) {
            conn.execute(
                "ALTER TABLE user_anime ADD COLUMN image_url TEXT NOT NULL DEFAULT ''",
                [],
            )?;
        }

        if !columns.contains(&"title".to_string()) {
            conn.execute(
                "ALTER TABLE user_anime ADD COLUMN title TEXT NOT NULL DEFAULT ''",
                [],
            )?;
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
            stmt.query_map(params![s], map_row)
                .map_err(|e| format!("Failed to execute query: {}", e))?
        }
        None => {
            println!("Executing query without status filter");
            stmt.query_map([], map_row)
                .map_err(|e| format!("Failed to execute query: {}", e))?
        }
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
        |_| Ok(true),
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
    match conn.execute(
        "DELETE FROM user_anime WHERE anime_id = ?1",
        params![anime_id],
    ) {
        Ok(rows) => {
            if rows > 0 {
                Ok(true)
            } else {
                // This should rarely happen since we checked existence
                Ok(false)
            }
        }
        Err(err) => Err(format!("Failed to delete anime: {}", err)),
    }
}

#[tauri::command]
pub fn export_user_data(
    export_path: Option<String>,
    export_type: Option<String>,
) -> Result<ExportResponse, String> {
    // Get current timestamp for the filename
    let now = chrono::Local::now();
    let timestamp = now.format("%Y%m%d_%H%M%S").to_string();

    // Determine which anime to export based on export_type
    let anime_list = match export_type.as_ref().map(|s| s.as_str()) {
        Some("watching") => list_user_anime(Some("watching".to_string()))?,
        Some("completed") => list_user_anime(Some("completed".to_string()))?,
        Some("planned") => list_user_anime(Some("planned".to_string()))?,
        Some("dropped") => list_user_anime(Some("dropped".to_string()))?,
        Some("on_hold") => list_user_anime(Some("on_hold".to_string()))?,
        _ => list_user_anime(None)?, // Default to full export
    };

    // Create the export data object with metadata
    let export_data = ExportData {
        version: "1.1".to_string(),
        timestamp: now.to_rfc3339(),
        metadata: ExportMetadata {
            app_version: env!("CARGO_PKG_VERSION").to_string(),
            os: std::env::consts::OS.to_string(),
            device_name: hostname::get()
                .map(|h| h.to_string_lossy().to_string())
                .unwrap_or_else(|_| "Unknown".to_string()),
            export_type: export_type.as_ref().unwrap_or(&"full".to_string()).clone(),
            entry_count: anime_list.len(),
        },
        anime_list,
    };

    // Serialize to JSON
    let json_data = match serde_json::to_string_pretty(&export_data) {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to serialize export data: {}", e)),
    };

    // Determine the export path
    let export_file_path = match export_path {
        Some(path) => PathBuf::from(path),
        None => {
            // Use the app's data directory for default export
            let mut default_path = get_db_path().parent().unwrap().to_path_buf();
            let export_type_str = export_type.as_ref().unwrap_or(&"full".to_string()).clone();
            default_path.push(format!(
                "anitrack_export_{}_{}.json",
                export_type_str, timestamp
            ));
            default_path
        }
    };

    // Create export directory if it doesn't exist
    if let Some(parent) = export_file_path.parent() {
        if !parent.exists() {
            match fs::create_dir_all(parent) {
                Ok(_) => {}
                Err(e) => return Err(format!("Failed to create export directory: {}", e)),
            }
        }
    }

    // Write to file
    match fs::write(&export_file_path, json_data) {
        Ok(_) => Ok(ExportResponse {
            path: export_file_path.to_string_lossy().to_string(),
            entry_count: export_data.metadata.entry_count,
            export_type: export_data.metadata.export_type,
            timestamp: export_data.timestamp,
        }),
        Err(e) => Err(format!("Failed to write export file: {}", e)),
    }
}

#[tauri::command]
pub fn import_user_data(options: ImportOptions) -> Result<ImportResult, String> {
    // Read the import file
    let json_data = match fs::read_to_string(&options.import_path) {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to read import file: {}", e)),
    };

    // Deserialize the JSON
    let import_data: ExportData = match serde_json::from_str(&json_data) {
        Ok(data) => data,
        Err(e) => return Err(format!("Failed to parse import file: {}", e)),
    };

    // Filter anime list based on import_type
    let filtered_anime_list = if options.import_type == "all" {
        import_data.anime_list
    } else {
        import_data
            .anime_list
            .into_iter()
            .filter(|anime| anime.status.to_lowercase() == options.import_type.to_lowercase())
            .collect()
    };

    // Create result structure
    let mut import_result = ImportResult {
        total_entries: filtered_anime_list.len() as i32,
        imported_entries: 0,
        updated_entries: 0,
        skipped_entries: 0,
        conflict_entries: 0,
        error_message: None,
        import_type: options.import_type,
        merge_strategy: options.merge_strategy.clone(),
    };

    // Get database connection
    let conn = DB_CONNECTION.lock().unwrap();

    // If replacing all data, clear the existing data
    if options.merge_strategy == "replace" {
        match conn.execute("DELETE FROM user_anime", []) {
            Ok(_) => {
                println!("Cleared existing anime data for full import");
            }
            Err(e) => {
                return Err(format!("Failed to clear existing data: {}", e));
            }
        }
    }

    // Import each anime in the filtered list
    for anime in &filtered_anime_list {
        // Check if the anime already exists
        let existing_anime = match conn.query_row(
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
            }
        ) {
            Ok(anime) => Some(anime),
            Err(rusqlite::Error::QueryReturnedNoRows) => None,
            Err(e) => {
                return Err(format!("Error checking if anime exists: {}", e));
            }
        };

        match (existing_anime, &options.merge_strategy[..], &options.conflict_resolution[..]) {
            // No existing anime, just insert
            (None, _, _) => {
                match conn.execute(
                    "INSERT INTO user_anime 
                     (anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title)
                     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)",
                    params![
                        anime.anime_id, anime.status, anime.score, anime.progress,
                        anime.notes, anime.favorite, anime.start_date, anime.end_date,
                        anime.image_url, anime.title
                    ],
                ) {
                    Ok(_) => {
                        import_result.imported_entries += 1;
                    },
                    Err(e) => {
                        return Err(format!("Failed to insert anime during import: {}", e));
                    }
                }
            },
            
            // Skip existing entries
            (Some(_), "skip_existing", _) => {
                import_result.skipped_entries += 1;
            },
            
            // Always use imported data
            (Some(_), _, "use_imported") => {
                match conn.execute(
                    "UPDATE user_anime SET 
                     status = ?1, score = ?2, progress = ?3, notes = ?4, 
                     favorite = ?5, start_date = ?6, end_date = ?7, 
                     image_url = ?8, title = ?9
                     WHERE anime_id = ?10",
                    params![
                        anime.status, anime.score, anime.progress, anime.notes,
                        anime.favorite, anime.start_date, anime.end_date,
                        anime.image_url, anime.title, anime.anime_id
                    ],
                ) {
                    Ok(_) => {
                        import_result.updated_entries += 1;
                    },
                    Err(e) => {
                        return Err(format!("Failed to update anime during import: {}", e));
                    }
                }
            },
            
            // Keep existing data
            (Some(_), _, "keep_existing") => {
                import_result.skipped_entries += 1;
            },
            
            // Keep newer data based on end_date
            (Some(existing), _, "keep_newer") => {
                // Parse dates for comparison
                let existing_date = existing
                    .end_date
                    .as_ref()
                    .and_then(|d| chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d").ok());
                
                let imported_date = anime
                    .end_date
                    .as_ref()
                    .and_then(|d| chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d").ok());
                
                let use_imported = match (existing_date, imported_date) {
                    (Some(e_date), Some(i_date)) => i_date > e_date,
                    (None, Some(_)) => true,
                    _ => false,
                };
                
                if use_imported {
                    match conn.execute(
                        "UPDATE user_anime SET 
                         status = ?1, score = ?2, progress = ?3, notes = ?4, 
                         favorite = ?5, start_date = ?6, end_date = ?7, 
                         image_url = ?8, title = ?9
                         WHERE anime_id = ?10",
                        params![
                            anime.status, anime.score, anime.progress, anime.notes,
                            anime.favorite, anime.start_date, anime.end_date,
                            anime.image_url, anime.title, anime.anime_id
                        ],
                    ) {
                        Ok(_) => {
                            import_result.updated_entries += 1;
                        },
                        Err(e) => {
                            return Err(format!("Failed to update anime during import: {}", e));
                        }
                    }
                } else {
                    import_result.skipped_entries += 1;
                }
            },
            
            // Fallback: Merge strategy by default
            _ => {
                match conn.execute(
                    "UPDATE user_anime SET 
                     status = ?1, score = ?2, progress = ?3, notes = ?4, 
                     favorite = ?5, start_date = ?6, end_date = ?7, 
                     image_url = ?8, title = ?9
                     WHERE anime_id = ?10",
                    params![
                        anime.status, anime.score, anime.progress, anime.notes,
                        anime.favorite, anime.start_date, anime.end_date,
                        anime.image_url, anime.title, anime.anime_id
                    ],
                ) {
                    Ok(_) => {
                        import_result.updated_entries += 1;
                    },
                    Err(e) => {
                        return Err(format!("Failed to update anime during import: {}", e));
                    }
                }
            }
        }
    }

    Ok(import_result)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ImportResult {
    pub total_entries: i32,
    pub imported_entries: i32,
    pub updated_entries: i32,
    pub skipped_entries: i32,
    pub conflict_entries: i32,
    pub error_message: Option<String>,
    pub import_type: String,
    pub merge_strategy: String,
}

#[tauri::command]
pub fn get_anime_by_id(anime_id: i64) -> Result<Option<UserAnime>, String> {
    get_user_anime(anime_id)
}

#[tauri::command]
pub fn get_anime_list(status: Option<String>) -> Result<Vec<UserAnime>, String> {
    list_user_anime(status)
}

#[tauri::command]
pub fn add_anime_to_list(anime: UserAnime) -> Result<UserAnime, String> {
    add_user_anime(anime)
}

#[tauri::command]
pub fn update_anime_in_list(anime: UserAnime) -> Result<UserAnime, String> {
    add_user_anime(anime) // We're using the same function as it handles updates too
}

#[tauri::command]
pub fn remove_anime_from_list(anime_id: i64) -> Result<bool, String> {
    delete_user_anime(anime_id)
}

#[tauri::command]
pub fn get_anime_stats() -> Result<AnimeStats, String> {
    let conn = DB_CONNECTION.lock().unwrap();

    // Get counts for each status
    let watching = count_anime_by_status(&conn, "watching")?;
    let completed = count_anime_by_status(&conn, "completed")?;
    let on_hold = count_anime_by_status(&conn, "on_hold")?;
    let dropped = count_anime_by_status(&conn, "dropped")?;
    let plan_to_watch = count_anime_by_status(&conn, "planned")?;

    // Get total episodes watched
    let total_episodes = conn
        .query_row("SELECT SUM(progress) FROM user_anime", [], |row| {
            row.get::<_, i64>(0)
        })
        .unwrap_or(0);

    // Get mean score
    let mean_score = conn
        .query_row(
            "SELECT AVG(score) FROM user_anime WHERE score > 0",
            [],
            |row| row.get::<_, f64>(0),
        )
        .unwrap_or(0.0);

    Ok(AnimeStats {
        total: watching + completed + on_hold + dropped + plan_to_watch,
        watching,
        completed,
        on_hold,
        dropped,
        plan_to_watch,
        total_episodes,
        mean_score,
    })
}

fn count_anime_by_status(conn: &rusqlite::Connection, status: &str) -> Result<i64, String> {
    conn.query_row(
        "SELECT COUNT(*) FROM user_anime WHERE status = ?1",
        [status],
        |row| row.get(0),
    )
    .map_err(|e| format!("Failed to count anime with status {}: {}", status, e))
}

#[tauri::command]
pub fn search_anime_in_list(query: String) -> Result<Vec<UserAnime>, String> {
    let conn = DB_CONNECTION.lock().unwrap();

    let mut stmt = conn
        .prepare(
            "SELECT id, anime_id, status, score, progress, notes, favorite, start_date, end_date, image_url, title
             FROM user_anime 
             WHERE title LIKE ?1
             ORDER BY id DESC"
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let search_pattern = format!("%{}%", query);

    let mut user_anime_list = Vec::new();

    let rows = stmt
        .query_map([search_pattern], |row| {
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
        })
        .map_err(|e| format!("Failed to execute query: {}", e))?;

    for user_anime in rows {
        user_anime_list.push(user_anime.map_err(|e| format!("Failed to retrieve row: {}", e))?);
    }

    Ok(user_anime_list)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnimeStats {
    pub total: i64,
    pub watching: i64,
    pub completed: i64,
    pub on_hold: i64,
    pub dropped: i64,
    pub plan_to_watch: i64,
    pub total_episodes: i64,
    pub mean_score: f64,
}
