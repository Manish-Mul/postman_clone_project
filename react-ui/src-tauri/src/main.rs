use std::process::Command;
use std::env;

fn main() {
  let exe_path = env::current_exe().expect("failed to get exe path");
  let exe_dir = exe_path.parent().unwrap();

  let backend_exe = exe_dir.join("backend").join("backend.exe");

  println!("Starting backend at: {:?}", backend_exe);

  Command::new(backend_exe)
    .spawn()
    .expect("failed to start backend");

  tauri::Builder::default()
    .run(tauri::generate_context!())
    .expect("error while running tauri app");
}
