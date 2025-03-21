// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod db;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            db::add_user_anime,
            db::get_user_anime,
            db::list_user_anime,
            db::delete_user_anime
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
