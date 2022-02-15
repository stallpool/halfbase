defmodule TinyserverTest do
  use ExUnit.Case
  doctest Tinyserver

  test "greets the world" do
    assert Tinyserver.hello() == :world
  end
end
