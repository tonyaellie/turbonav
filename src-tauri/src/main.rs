// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dirs::home_dir;
use serde::Serialize;

#[derive(Serialize)]
struct File {
    file_name: String,
    file_type: String,
}

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn get_files(dir: Vec<&str>) -> Result<Vec<File>, String> {
    let dir = dir.join("/").replace('~', home_dir().unwrap().to_str().unwrap());
    println!("{}", dir);
    let files = std::fs::read_dir(dir);
    // check if the directory exists
    if files.is_err() {
        return Err(
            "The directory does not exist, please check the directory and try again".to_string(),
        );
    }
    // store file data
    // {
    //    file_name: String,
    //    file_type: String,
    // }
    let mut file_data = Vec::new();
    for file in files.unwrap() {
        let file_type;
        let file = file.unwrap();
        let file_name = file.file_name().to_str().unwrap().to_string();
        if file.file_type().unwrap().is_dir() {
            file_type = "dir".to_string();
        } else if file.file_type().unwrap().is_file() {
            file_type = "file".to_string();
        } else if file.file_type().unwrap().is_symlink() {
            file_type = "symlink".to_string();
        } else {
            file_type = "unknown".to_string();
        }
        let file = File {
            file_name,
            file_type,
        };
        file_data.push(file);
    }
    Ok(file_data)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
