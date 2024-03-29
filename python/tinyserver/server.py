import http.server
import json

def process_api(client):
   client.send_response(200)
   client.send_header("Content-Type", "application/json")
   client.end_headers()
   data = {"ok": True}
   client.wfile.write(bytes(json.dumps(data), "utf8"))

class Handler(http.server.SimpleHTTPRequestHandler) :
   def do_GET(self) :
      print('GET %s --> %s)' % (self.path, self.client_address))
      print(self.headers)
      if self.path == "/favicon.ico":
         super(Handler, self).do_GET()
      else:
         process_api(self)

if __name__ == "__main__":
   from sys import argv
   port = 8080
   if len(argv) == 2:
       port = int(argv[1])
   print(f"Tiny server is running at 0.0.0.0:{port} ...")
   s = http.server.HTTPServer( ('', port), Handler )
   s.serve_forever()
