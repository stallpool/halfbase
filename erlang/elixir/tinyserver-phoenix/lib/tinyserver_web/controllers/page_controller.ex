defmodule TinyserverWeb.PageController do
  use TinyserverWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
