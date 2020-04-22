package main

// ref/basic: https://golang.org/doc/articles/wiki/
// - form     | r.FormValue("key")
// - redirect | http.Redirect(w, r, "/edit/"+title, http.StatusFound)
// - error    | http.Error(w, err.Error(), http.StatusInternalServerError) | http.NotFound(w, r)
// - cache    | var templates = template.Must(template.ParseFiles("edit.html", "view.html")); templates.ExecuteTemplate(w, tmpl+".html", p)
// ref/https: https://gist.github.com/denji/12b3a568f092ab951456

import (
	"fmt"
	"log"
	"os"
	"path"
	"strconv"
	"net/http"
)

type Server struct {
	debug            bool
	serverStaticDir  string
	serverHttpsCADir string
	serverHttpsCertFilename string
	serverHttpsKeyFilename  string
	serverListen     string
}

func handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Add("Content-Type", "text/plain")
	fmt.Fprintf(w, "Hi there, I love %s!", r.URL.Path[1:])
}

func _downloadHandler(w http.ResponseWriter, r *http.Request) {
	// http.ServeFile(w, r, "/path/to/a/file")

	// type P struct { Body []byte }
	// // template.html: <div>{{printf "%s" .Body}}</div>
	// body, _ := ioutil.ReadFile("/path/to/a/file")
	// p := &P{Body: body}
	// t, _ := template.ParseFiles("/path/to/template.html")
	// t.Execute(w, p)
}

func parseEnv() (s Server) {
	s.debug = len(os.Getenv("TINY_DEBUG")) > 0
	s.serverStaticDir = os.Getenv("TINY_STATIC_DIR")
	s.serverHttpsCADir = os.Getenv("TINY_HTTPS_CA_DIR")

	serverHost := os.Getenv("TINY_HOST")
	serverPort, _ := strconv.Atoi(os.Getenv("TINY_PORT"))
	if serverPort <= 0 {
		serverPort = 8080
	}
	s.serverListen = fmt.Sprintf("%s:%d", serverHost, serverPort)


	if len(s.serverHttpsCADir) > 0 {
		s.serverHttpsCertFilename = path.Join(s.serverHttpsCADir, "ca.pem")
		s.serverHttpsKeyFilename = path.Join(s.serverHttpsCADir, "ca.key")
		fileInfo, err := os.Stat(s.serverHttpsCertFilename)
		if os.IsNotExist(err) || fileInfo.IsDir() {
			s.serverHttpsCertFilename = ""
			s.serverHttpsKeyFilename = ""
		}
		fileInfo, err = os.Stat(s.serverHttpsKeyFilename)
		if os.IsNotExist(err) || fileInfo.IsDir() {
			s.serverHttpsCertFilename = ""
			s.serverHttpsKeyFilename = ""
		}
	}

	if len(s.serverStaticDir) > 0 {
		fileInfo, err := os.Stat(s.serverStaticDir)
		if os.IsNotExist(err) || !fileInfo.IsDir() {
			s.serverStaticDir = ""
		}
	}

	fmt.Printf("Server Config: %q\n", s)
	return s
}

func main() {
	config := parseEnv()
	mux := http.NewServeMux()
	mux.HandleFunc("/hello", handler)
	fileServer := http.FileServer(http.Dir(config.serverStaticDir))
	mux.Handle("/static/", http.StripPrefix("/static", fileServer))

	if len(config.serverHttpsCertFilename) > 0 {
		log.Fatal(http.ListenAndServeTLS(config.serverListen, config.serverHttpsCertFilename, config.serverHttpsKeyFilename, mux))
	} else {
		log.Fatal(http.ListenAndServe(config.serverListen, mux))
	}
}
