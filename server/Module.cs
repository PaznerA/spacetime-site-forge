
using SpacetimeDB;
using System;
using System.Linq;

// Main Module file that brings everything together
public static partial class Module
{
    // Lifecycle reducers

    [SpacetimeDB.Reducer(ReducerKind.Init)]
    public static void Init(ReducerContext ctx)
    {
        Log.Info("SpacetimeDB Web Editor Module initialized!");
        
        // Check if we need to create an admin user
        if (!Database.Table<User>().Any())
        {
            // Create an admin user for system administration
            CreateAdminUser();
        }
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
    
    // Helper method to create an admin user when the module is initialized
    private static void CreateAdminUser()
    {
        string salt = GenerateRandomSalt();
        string passwordHash = HashPassword("admin123", salt); // Default password, should be changed immediately
        
        var adminUser = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = "admin",
            Email = "admin@example.com",
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            LastLogin = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PasswordHash = passwordHash,
            Salt = salt,
            IsAdmin = true,
            ProfilePictureUrl = "",
            Bio = "System administrator account",
            Settings = "{}",
            IsActive = true
        };
        
        Database.Insert(adminUser);
        Log.Info("Admin user created");
    }
    
    // Helper method to generate a random salt
    private static string GenerateRandomSalt()
    {
        byte[] saltBytes = new byte[16];
        using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        return Convert.ToBase64String(saltBytes);
    }
    
    // Helper method to hash passwords
    private static string HashPassword(string password, string salt)
    {
        using (var sha256 = System.Security.Cryptography.SHA256.Create())
        {
            byte[] passwordBytes = System.Text.Encoding.UTF8.GetBytes(password + salt);
            byte[] hashBytes = sha256.ComputeHash(passwordBytes);
            return Convert.ToBase64String(hashBytes);
        }
    }
}
