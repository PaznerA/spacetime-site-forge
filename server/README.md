
# Web Editor SpaceTimeDB Backend

This is the C# backend for the Web Editor application using SpaceTimeDB.

## Prerequisites

- .NET 7.0 SDK or later
- SpaceTimeDB SDK for C#

## Setup

1. Install the SpaceTimeDB CLI:
   ```
   curl -fsSL https://spacetimedb.com/install.sh | bash
   ```

2. Install the SpaceTimeDB C# SDK:
   ```
   dotnet add package SpaceTimeDB.Client
   ```

3. Create a SpaceTimeDB project:
   ```
   spacetime init server --lang csharp
   spacetime generate --lang typescript --out-dir ./src/autogen --project-path ./server
   ```

4. Build and run the backend:
   ```
   dotnet build
   spacetime run
   ```

## Database Schema

The backend consists of the following tables:

- **Project**: Stores web editor projects
- **Component**: Stores reusable UI components
- **Client**: Stores user/client information
- **Setting**: Stores user preferences and application settings

## Connecting from Frontend

To connect the React frontend to this backend:

1. Update the `src/lib/spacetime-db.ts` file to use a real SpaceTimeDB client instead of the mock implementation.
2. Configure connection settings to point to your SpaceTimeDB instance.
