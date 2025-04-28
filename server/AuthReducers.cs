
using SpacetimeDB;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Linq;

// Authentication reducers
public static class AuthReducers
{
    // Register a new user
    [SpacetimeDB.Reducer]
    public static void RegisterUser(ReducerContext ctx, string username, string email, string password)
    {
        // Check if username already exists
        var existingUserByUsername = Database.Table<User>().ToList()
            .FirstOrDefault(u => u.Username.ToLower() == username.ToLower());
            
        if (existingUserByUsername != null)
        {
            Log.Error($"Username {username} already exists");
            return;
        }
        
        // Check if email already exists
        var existingUserByEmail = Database.Table<User>().ToList()
            .FirstOrDefault(u => u.Email.ToLower() == email.ToLower());
            
        if (existingUserByEmail != null)
        {
            Log.Error($"Email {email} already exists");
            return;
        }
        
        // Generate salt and hash password
        string salt = GenerateSalt();
        string passwordHash = HashPassword(password, salt);
        
        // Create user
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            Email = email,
            CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            LastLogin = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            PasswordHash = passwordHash,
            Salt = salt,
            IsAdmin = false,
            ProfilePictureUrl = "",
            Bio = "",
            Settings = "{}",
            IsActive = true
        };
        
        Database.Insert(user);
        Log.Info($"User registered: {username}");

        // Return session token or relevant user data
        // In a real application, you would generate a JWT or session token here
    }
    
    // Login user
    [SpacetimeDB.Reducer]
    public static void LoginUser(ReducerContext ctx, string usernameOrEmail, string password)
    {
        // Find the user by username or email
        var user = Database.Table<User>().ToList()
            .FirstOrDefault(u => 
                (u.Username.ToLower() == usernameOrEmail.ToLower() || 
                u.Email.ToLower() == usernameOrEmail.ToLower()) && 
                u.IsActive);
                
        if (user == null)
        {
            Log.Error($"User not found: {usernameOrEmail}");
            return;
        }
        
        // Verify password
        string hashedPassword = HashPassword(password, user.Salt);
        if (hashedPassword != user.PasswordHash)
        {
            Log.Error("Invalid password for user: " + usernameOrEmail);
            return;
        }
        
        // Update last login time
        var updatedUser = user with { LastLogin = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() };
        Database.Update(updatedUser);
        
        Log.Info($"User logged in: {user.Username}");
        
        // Return session token or relevant user data
        // In a real application, you would generate a JWT or session token here
    }
    
    // Change user password
    [SpacetimeDB.Reducer]
    public static void ChangePassword(ReducerContext ctx, string userId, string currentPassword, string newPassword)
    {
        // Find user
        var user = Database.Table<User>().ToList()
            .FirstOrDefault(u => u.Id == userId && u.IsActive);
            
        if (user == null)
        {
            Log.Error($"User not found: {userId}");
            return;
        }
        
        // Verify current password
        string hashedCurrentPassword = HashPassword(currentPassword, user.Salt);
        if (hashedCurrentPassword != user.PasswordHash)
        {
            Log.Error("Current password is incorrect for user: " + userId);
            return;
        }
        
        // Generate new salt and hash for security
        string newSalt = GenerateSalt();
        string newPasswordHash = HashPassword(newPassword, newSalt);
        
        // Update user with new password hash and salt
        var updatedUser = user with 
        { 
            PasswordHash = newPasswordHash,
            Salt = newSalt
        };
        
        Database.Update(updatedUser);
        Log.Info($"Password changed for user: {user.Username}");
    }
    
    // Deactivate user account
    [SpacetimeDB.Reducer]
    public static void DeactivateUser(ReducerContext ctx, string userId)
    {
        // Find user
        var user = Database.Table<User>().ToList()
            .FirstOrDefault(u => u.Id == userId);
            
        if (user == null)
        {
            Log.Error($"User not found: {userId}");
            return;
        }
        
        // Deactivate user
        var deactivatedUser = user with { IsActive = false };
        Database.Update(deactivatedUser);
        
        Log.Info($"User deactivated: {user.Username}");
    }
    
    // Helper method to generate a random salt
    private static string GenerateSalt()
    {
        byte[] saltBytes = new byte[16];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(saltBytes);
        }
        return Convert.ToBase64String(saltBytes);
    }
    
    // Helper method to hash a password with a salt
    private static string HashPassword(string password, string salt)
    {
        using (var sha256 = SHA256.Create())
        {
            byte[] passwordBytes = Encoding.UTF8.GetBytes(password + salt);
            byte[] hashBytes = sha256.ComputeHash(passwordBytes);
            return Convert.ToBase64String(hashBytes);
        }
    }
}
