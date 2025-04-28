using SpacetimeDB;
using System;
using System.Linq;

// Main Module file that brings everything together
public static partial class Module
{
    // Pomocné metody pro lifecycle reducery

    [SpacetimeDB.Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        Log.Info("SpacetimeDB Web Editor Module initialized!");
    }

    [SpacetimeDB.Reducer(ReducerKind.ClientConnected)]
    public static void ClientConnected(ReducerContext ctx)
    {
        Log.Info($"Client connected!");
    }

    [SpacetimeDB.Reducer(ReducerKind.ClientDisconnected)]
    public static void ClientDisconnected(ReducerContext ctx)
    {
        Log.Info($"Client disconnected!");
    }
}
