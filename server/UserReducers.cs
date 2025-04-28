using SpacetimeDB;
using System;
using System.Linq;

// User reducery v samostatném souboru
public static partial class Module
{
    [SpacetimeDB.Reducer]
    public static void RegisterUser(ReducerContext ctx, string username, string email, string password)
    {
        var now = GetCurrentTimestamp();
        
        // Check if username already exists
        if (ctx.Db.User.Iter().Any(u => u.Username == username))
        {
            throw new Exception($"Username '{username}' is already taken");
        }
        
        // Check if email already exists
        if (ctx.Db.User.Iter().Any(u => u.Email == email))
        {
            throw new Exception($"Email '{email}' is already registered");
        }
        
        // Generate salt and hash password
        var salt = GenerateSalt();
        var passwordHash = HashPassword(password, salt);
        
        // Create new user
        var user = new User
        {
            Id = Guid.NewGuid().ToString(),
            Username = username,
            Email = email,
            PasswordHash = passwordHash,
            Salt = salt,
            CreatedAt = now,
            LastLogin = now,
            IsAdmin = false,
            ProfilePictureUrl = "",
            Bio = "",
            Settings = "{}",
            IsActive = true,
        };
        
        ctx.Db.User.Insert(user);
        Log.Info($"User registered: {username} ({email})");
    }
    
    [SpacetimeDB.Reducer]
    public static void LoginUser(ReducerContext ctx, string usernameOrEmail, string password)
    {
        var now = GetCurrentTimestamp();
        
        // Find user by username or email
        var user = ctx.Db.User.Iter()
            .FirstOrDefault(u => u.Username == usernameOrEmail || u.Email == usernameOrEmail);
        
        if (user.Equals(default(User)))
        {
            throw new Exception("Invalid username/email or password");
        }
        
        // Check password
        var passwordHash = HashPassword(password, user.Salt);
        if (passwordHash != user.PasswordHash)
        {
            throw new Exception("Invalid username/email or password");
        }
        
        // Update last login
        foreach (var u in ctx.Db.User.Iter().Where(u => u.Id == user.Id))
        {
            ctx.Db.User.Delete(u);
        }
        
        var updatedUser = new User
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            PasswordHash = user.PasswordHash,
            Salt = user.Salt,
            CreatedAt = user.CreatedAt,
            LastLogin = now,
            IsAdmin = user.IsAdmin,
            ProfilePictureUrl = user.ProfilePictureUrl,
            Bio = user.Bio,
            Settings = user.Settings,
            IsActive = user.IsActive,
        };
        
        ctx.Db.User.Insert(updatedUser);
        Log.Info($"User logged in: {user.Username}");
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateUserProfile(ReducerContext ctx, string userId, string bio, string profilePictureUrl)
    {
        var userOpt = ctx.Db.User.Iter().FirstOrDefault(u => u.Id == userId);
        
        if (userOpt.Equals(default(User)))
        {
            throw new Exception($"User with ID {userId} not found");
        }
        
        foreach (var user in ctx.Db.User.Iter().Where(u => u.Id == userId))
        {
            ctx.Db.User.Delete(user);
        }
        
        var updatedUser = new User
        {
            Id = userOpt.Id,
            Username = userOpt.Username,
            Email = userOpt.Email,
            PasswordHash = userOpt.PasswordHash,
            Salt = userOpt.Salt,
            CreatedAt = userOpt.CreatedAt,
            LastLogin = userOpt.LastLogin,
            IsAdmin = userOpt.IsAdmin,
            ProfilePictureUrl = profilePictureUrl,
            Bio = bio,
            Settings = userOpt.Settings,
            IsActive = userOpt.IsActive,
        };
        
        ctx.Db.User.Insert(updatedUser);
        Log.Info($"Updated profile for user {userOpt.Username}");
    }
    
    [SpacetimeDB.Reducer]
    public static void ChangePassword(ReducerContext ctx, string userId, string currentPassword, string newPassword)
    {
        var userOpt = ctx.Db.User.Iter().FirstOrDefault(u => u.Id == userId);
        
        if (userOpt.Equals(default(User)))
        {
            throw new Exception($"User with ID {userId} not found");
        }
        
        // Verify current password
        var currentHash = HashPassword(currentPassword, userOpt.Salt);
        if (currentHash != userOpt.PasswordHash)
        {
            throw new Exception("Current password is incorrect");
        }
        
        // Generate new salt and hash for the new password
        var newSalt = GenerateSalt();
        var newHash = HashPassword(newPassword, newSalt);
        
        foreach (var user in ctx.Db.User.Iter().Where(u => u.Id == userId))
        {
            ctx.Db.User.Delete(user);
        }
        
        var updatedUser = new User
        {
            Id = userOpt.Id,
            Username = userOpt.Username,
            Email = userOpt.Email,
            PasswordHash = newHash,
            Salt = newSalt,
            CreatedAt = userOpt.CreatedAt,
            LastLogin = userOpt.LastLogin,
            IsAdmin = userOpt.IsAdmin,
            ProfilePictureUrl = userOpt.ProfilePictureUrl,
            Bio = userOpt.Bio,
            Settings = userOpt.Settings,
            IsActive = userOpt.IsActive,
        };
        
        ctx.Db.User.Insert(updatedUser);
        Log.Info($"Password changed for user {userOpt.Username}");
    }
    
    [SpacetimeDB.Reducer]
    public static void DeactivateUser(ReducerContext ctx, string userId)
    {
        var userOpt = ctx.Db.User.Iter().FirstOrDefault(u => u.Id == userId);
        
        if (userOpt.Equals(default(User)))
        {
            throw new Exception($"User with ID {userId} not found");
        }
        
        foreach (var user in ctx.Db.User.Iter().Where(u => u.Id == userId))
        {
            ctx.Db.User.Delete(user);
        }
        
        var updatedUser = new User
        {
            Id = userOpt.Id,
            Username = userOpt.Username,
            Email = userOpt.Email,
            PasswordHash = userOpt.PasswordHash,
            Salt = userOpt.Salt,
            CreatedAt = userOpt.CreatedAt,
            LastLogin = userOpt.LastLogin,
            IsAdmin = userOpt.IsAdmin,
            ProfilePictureUrl = userOpt.ProfilePictureUrl,
            Bio = userOpt.Bio,
            Settings = userOpt.Settings,
            IsActive = false,
        };
        
        ctx.Db.User.Insert(updatedUser);
        Log.Info($"User {userOpt.Username} deactivated");
    }
}
