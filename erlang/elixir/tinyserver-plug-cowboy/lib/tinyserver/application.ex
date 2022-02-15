defmodule Tinyserver.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application
  require Logger

  @impl true
  def start(_type, _args) do
    children = [
      # Starts a worker by calling: Tinyserver.Worker.start_link(arg)
      # {Tinyserver.Worker, arg}
      {Plug.Cowboy, scheme: :http, plug: ApiTest, options: [port: 8081]}	
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Tinyserver.Supervisor]
    Logger.info("starting api server ...")
    Supervisor.start_link(children, opts)
  end
end
