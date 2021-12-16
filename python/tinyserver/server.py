import http.server

class Handler(http.server.SimpleHTTPRequestHandler) :
   def do_GET(s) :
      print('GET %s --> %s)' % (s.path, s.client_address))
      print(s.headers)
      super(Handler, s).do_GET()

if __name__ == "__main__":
   from sys import argv
   port = 8080
   if len(argv) == 2:
       port = int(argv[1])
   s = http.server.HTTPServer( ('', port), Handler )
   s.serve_forever()
