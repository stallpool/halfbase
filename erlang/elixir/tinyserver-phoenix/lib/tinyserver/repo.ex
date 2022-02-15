defmodule Tinyserver.Repo do
  use Ecto.Repo,
    otp_app: :tinyserver,
    adapter: Ecto.Adapters.SQLite3
end
