use std::io::BufReader;
use std::io::prelude::*;
use std::env;
use std::net::{TcpListener, TcpStream};

struct Config<'a> {
   host: &'a str,
   port: &'a str,
}

fn main() {
   let host = env::var("TINY_HOST").unwrap_or("127.0.0.1".to_string());
   let port = env::var("TINY_PORT").unwrap_or("8181".to_string());
   let config = Config{
      host: host.as_str(),
      port: port.as_str()
   };

   let server = match TcpListener::bind(format!("{}:{}", config.host, config.port)) {
      Ok(s) => s,
      _ => panic!("cannot create server at {}:{}", config.host, config.port)
   };
   println!("TINY SERVER is running at {}:{} ...", config.host, config.port);
   for stream in server.incoming() {
      let stream = stream.unwrap();
      handle_connection(stream);
   }
}

fn handle_connection(mut stream: TcpStream) {
   if !parse_header(&stream) { return; }
   // TODO: read request body
   // let mut buffer = [0; 1024];
   // stream.read(&mut buffer).unwrap();
   // println!("Request: {}", String::from_utf8_lossy(&buffer[..]));

   let response = "HTTP/1.1 200 OK\r\n\r\ntest";
   stream.write(response.as_bytes()).unwrap();
   stream.flush().unwrap();
}

fn parse_header(stream: &TcpStream) -> bool {
   let stream = stream.try_clone();
   if let Err(err) = stream {
      eprintln!("[parse_request] stream error: {:?}", err);
      return false;
   }
   let stream = stream.unwrap();
   let mut reader = BufReader::new(stream);
   loop {
      let mut line = String::new();
      // TODO: use a thread for read_line;
      //       if timeout, stop it
      // TODO: how to deal with too long line (DoS)
      let n = match reader.read_line(&mut line) {
         Ok(v) => v,
         Err(err) => {
            eprintln!("[parse_request] read error: {:?}", err);
            return false;
         }
      };
      if n <= 0 {
         break;
      }
      if (n == 2) & (line == "\r\n") {
         break;
      }
      println!(
         ">>> {}",
         line.chars().into_iter().take(line.len()-1).collect::<String>()
      );
   }
   return true;
}
