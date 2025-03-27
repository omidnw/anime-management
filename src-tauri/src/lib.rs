// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod api;
mod db;
mod filesystem;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            db::get_anime_by_id,
            db::get_anime_list,
            db::add_anime_to_list,
            db::update_anime_in_list,
            db::remove_anime_from_list,
            db::get_anime_stats,
            db::search_anime_in_list,
            db::add_user_anime,
            db::get_user_anime,
            db::list_user_anime,
            db::delete_user_anime,
            db::export_user_data,
            db::import_user_data,
            api::search_anime,
            api::get_anime_details,
            api::get_seasonal_anime,
            api::get_anime_recommendations,
            filesystem::create_directory,
            filesystem::file_exists,
            filesystem::read_file,
            filesystem::write_file,
            filesystem::create_dir_if_not_exists,
            filesystem::get_file_info,
            filesystem::write_binary_file,
            filesystem::get_documents_dir,
            filesystem::create_zip_archive,
            filesystem::clear_image_cache,
            filesystem::get_cache_stats,
            filesystem::create_backup_zip
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
