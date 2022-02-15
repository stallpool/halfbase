defmodule ApiTest do
   use Plug.Router

   plug :match
   plug :dispatch

   get "/" do
      conn
      |> put_resp_content_type("text/plain")
      |> send_resp(200, "Hello World!\n")
   end

   match _ do
      conn
      |> send_resp(404, "Oops!")
   end
end
