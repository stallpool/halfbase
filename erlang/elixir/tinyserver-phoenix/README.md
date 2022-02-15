# Tinyserver

To start your Phoenix server:

  * Install dependencies with `mix deps.get`
  * Create and migrate your database with `mix ecto.setup`
  * Start Phoenix endpoint with `mix phx.server` or inside IEx with `iex -S mix phx.server`

Now you can visit [`localhost:4000`](http://localhost:4000) from your browser.

Ready to run in production? Please [check our deployment guides](https://hexdocs.pm/phoenix/deployment.html).

## Learn more

  * Official website: https://www.phoenixframework.org/
  * Guides: https://hexdocs.pm/phoenix/overview.html
  * Docs: https://hexdocs.pm/phoenix
  * Forum: https://elixirforum.com/c/phoenix-forum
  * Source: https://github.com/phoenixframework/phoenix

```
mix archive.install hex phx_new
mix phx.new tinyserver --database sqlite3
   # by default it uses postgres
   # --no-etco means that no database
cd tinyserver
mix deps.get
mix assets.deploy
   # will do npm install (esbuild)
mix phx.server
   # open http://127.0.0.1:4000
```
