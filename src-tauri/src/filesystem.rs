use std::fs;
use std::path::Path;
use tauri::Manager;
use std::io::{Read, Write, Seek};
use serde::Serialize;
use zip::ZipWriter;
use zip::write::FileOptions;

#[derive(serde::Deserialize)]
pub enum StorageLocation {
    Documents,
    Home,
    AppData,
    Custom,
}

#[derive(Serialize)]
pub struct CacheStats {
    size_in_bytes: u64,
    image_count: usize,
}

// Helper function for adding directories to a zip file
pub fn add_dir_to_zip<T: Write + Seek>(
    prefix: &Path,
    path: &Path,
    zip: &mut ZipWriter<T>,
    options: &FileOptions,
) -> Result<(), String> {
    for entry in fs::read_dir(path).map_err(|e| format!("Failed to read directory: {}", e))? {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let path = entry.path();
        
        let name = path.strip_prefix(prefix)
            .map_err(|e| format!("Failed to strip prefix: {}", e))?;
        
        if path.is_file() {
            zip.start_file(
                name.to_string_lossy().into_owned(),
                *options,
            ).map_err(|e| format!("Failed to add file to zip: {}", e))?;
            
            let mut file = fs::File::open(&path)
                .map_err(|e| format!("Failed to open file: {}", e))?;
            
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer)
                .map_err(|e| format!("Failed to read file: {}", e))?;
            
            zip.write_all(&buffer)
                .map_err(|e| format!("Failed to write file to zip: {}", e))?;
        } else if path.is_dir() {
            zip.add_directory(
                name.to_string_lossy().into_owned(),
                *options,
            ).map_err(|e| format!("Failed to add directory to zip: {}", e))?;
            
            add_dir_to_zip(prefix, &path, zip, options)?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn create_directory(
    app_handle: tauri::AppHandle,
    folder_name: String,
    location: StorageLocation,
    custom_path: Option<String>,
    recursive: bool,
) -> Result<String, String> {
    let path = match location {
        StorageLocation::Documents => {
            app_handle
                .path()
                .document_dir()
                .map_err(|e| format!("Failed to get document directory: {}", e))?
                .join(folder_name)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::Home => {
            app_handle
                .path()
                .home_dir()
                .map_err(|e| format!("Failed to get home directory: {}", e))?
                .join(folder_name)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::AppData => {
            app_handle
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app data directory: {}", e))?
                .join(folder_name)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::Custom => {
            if let Some(custom) = custom_path {
                let path = Path::new(&custom).join(&folder_name);
                path.to_str().unwrap().to_string()
            } else {
                return Err("Custom path is required for custom location".to_string());
            }
        }
    };

    // Create the directory
    if recursive {
        fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
    } else {
        // Check if parent directory exists
        let parent = Path::new(&path).parent();
        if let Some(parent) = parent {
            if !parent.exists() {
                return Err(format!("Parent directory does not exist: {:?}", parent));
            }
        }
        fs::create_dir(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    Ok(path)
}

#[tauri::command]
pub fn file_exists(
    app_handle: tauri::AppHandle,
    file_path: String,
    location: StorageLocation,
    custom_path: Option<String>,
) -> Result<bool, String> {
    let full_path = get_full_path(app_handle, file_path, location, custom_path)?;
    Ok(Path::new(&full_path).exists())
}

#[tauri::command]
pub fn read_file(
    app_handle: tauri::AppHandle,
    file_path: String,
    location: StorageLocation,
    custom_path: Option<String>,
) -> Result<String, String> {
    let full_path = get_full_path(app_handle, file_path, location, custom_path)?;
    
    let mut file = fs::File::open(&full_path)
        .map_err(|e| format!("Failed to open file {}: {}", full_path, e))?;
    
    let mut contents = String::new();
    file.read_to_string(&mut contents)
        .map_err(|e| format!("Failed to read file {}: {}", full_path, e))?;
    
    Ok(contents)
}

#[tauri::command]
pub fn write_file(
    app_handle: tauri::AppHandle,
    file_path: String,
    content: String,
    location: StorageLocation,
    custom_path: Option<String>,
) -> Result<(), String> {
    let full_path = get_full_path(app_handle, file_path, location, custom_path)?;
    
    // Ensure the parent directory exists
    if let Some(parent) = Path::new(&full_path).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directories: {}", e))?;
        }
    }
    
    let mut file = fs::File::create(&full_path)
        .map_err(|e| format!("Failed to create file {}: {}", full_path, e))?;
    
    file.write_all(content.as_bytes())
        .map_err(|e| format!("Failed to write to file {}: {}", full_path, e))?;
    
    Ok(())
}

// Helper function to get full path based on location
fn get_full_path(
    app_handle: tauri::AppHandle,
    file_path: String,
    location: StorageLocation,
    custom_path: Option<String>,
) -> Result<String, String> {
    let path = match location {
        StorageLocation::Documents => {
            app_handle
                .path()
                .document_dir()
                .map_err(|e| format!("Failed to get document directory: {}", e))?
                .join(file_path)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::Home => {
            app_handle
                .path()
                .home_dir()
                .map_err(|e| format!("Failed to get home directory: {}", e))?
                .join(file_path)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::AppData => {
            app_handle
                .path()
                .app_data_dir()
                .map_err(|e| format!("Failed to get app data directory: {}", e))?
                .join(file_path)
                .to_str()
                .unwrap()
                .to_string()
        }
        StorageLocation::Custom => {
            if let Some(custom) = custom_path {
                let path = Path::new(&custom).join(&file_path);
                path.to_str().unwrap().to_string()
            } else {
                return Err("Custom path is required for custom location".to_string());
            }
        }
    };
    
    Ok(path)
}

#[tauri::command]
pub fn create_dir_if_not_exists(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    if !path.exists() {
        fs::create_dir_all(path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_file_info(path: String) -> Result<serde_json::Value, String> {
    let metadata = fs::metadata(&path).map_err(|e| format!("Failed to get file metadata: {}", e))?;
    
    let size = metadata.len();
    let is_dir = metadata.is_dir();
    let is_file = metadata.is_file();
    
    // Create a JSON object with the file info
    let file_info = serde_json::json!({
        "size": size,
        "is_directory": is_dir,
        "is_file": is_file,
    });
    
    Ok(file_info)
}

#[tauri::command]
pub fn write_binary_file(path: String, contents: Vec<u8>) -> Result<(), String> {
    // Ensure the parent directory exists
    if let Some(parent) = Path::new(&path).parent() {
        if !parent.exists() {
            fs::create_dir_all(parent)
                .map_err(|e| format!("Failed to create parent directories: {}", e))?;
        }
    }
    
    fs::write(&path, contents)
        .map_err(|e| format!("Failed to write binary file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn get_documents_dir() -> Result<String, String> {
    let home = dirs::document_dir()
        .ok_or_else(|| "Could not find documents directory".to_string())?;
    
    Ok(home.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_zip_archive(source_dir: String, output_path: String) -> Result<(), String> {
    let source_path = Path::new(&source_dir);
    if !source_path.exists() {
        return Err(format!("Source directory does not exist: {}", source_dir));
    }
    
    // Create a file to write the zip to
    let file = fs::File::create(&output_path)
        .map_err(|e| format!("Failed to create zip file: {}", e))?;
    
    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);
    
    // Add all files and directories from the source directory
    add_dir_to_zip(source_path, source_path, &mut zip, &options)?;
    
    // Finalize the zip file
    zip.finish().map_err(|e| format!("Failed to finalize zip file: {}", e))?;
    
    Ok(())
}

#[tauri::command]
pub fn clear_image_cache(cache_path: String) -> Result<(), String> {
    let path = Path::new(&cache_path);
    if !path.exists() {
        return Ok(());  // Nothing to clear
    }
    
    // Read the directory
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read cache directory: {}", e))?;
    
    // Delete each file
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let file_path = entry.path();
        
        if file_path.is_file() {
            fs::remove_file(&file_path)
                .map_err(|e| format!("Failed to delete file {}: {}", file_path.display(), e))?;
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn get_cache_stats(cache_path: String) -> Result<CacheStats, String> {
    let path = Path::new(&cache_path);
    if !path.exists() {
        return Ok(CacheStats {
            size_in_bytes: 0,
            image_count: 0,
        });
    }
    
    let mut total_size = 0;
    let mut image_count = 0;
    
    // Read the directory
    let entries = fs::read_dir(path)
        .map_err(|e| format!("Failed to read cache directory: {}", e))?;
    
    // Calculate total size and count
    for entry in entries {
        let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
        let file_path = entry.path();
        
        if file_path.is_file() {
            let metadata = fs::metadata(&file_path)
                .map_err(|e| format!("Failed to get file metadata: {}", e))?;
            
            total_size += metadata.len();
            image_count += 1;
        }
    }
    
    Ok(CacheStats {
        size_in_bytes: total_size,
        image_count,
    })
}

#[tauri::command]
pub fn create_backup_zip(source_dir: String, destination_dir: String, zip_name: String) -> Result<String, String> {
    let source_path = Path::new(&source_dir);
    if !source_path.exists() {
        return Err(format!("Source directory does not exist: {}", source_dir));
    }
    
    // Combine destination path and zip name
    let output_path = Path::new(&destination_dir).join(zip_name);
    let output_path_str = output_path.to_string_lossy().to_string();
    
    // Create a file to write the zip to
    let file = fs::File::create(&output_path)
        .map_err(|e| format!("Failed to create zip file: {}", e))?;
    
    let mut zip = ZipWriter::new(file);
    let options = FileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated)
        .unix_permissions(0o755);
    
    // Add all files and directories from the source directory
    add_dir_to_zip(source_path, source_path, &mut zip, &options)?;
    
    // Finalize the zip file
    zip.finish().map_err(|e| format!("Failed to finalize zip file: {}", e))?;
    
    Ok(output_path_str)
} 