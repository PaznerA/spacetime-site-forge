using SpacetimeDB;
using System;

// Definice entit v samostatném souboru pro lepší přehlednost
public static partial class Module
{
    // Project entity to store project information
    [SpacetimeDB.Table(Public = true)]
    public partial struct Project
    {
        [SpacetimeDB.PrimaryKey]
        public string Id;
        
        public string Name;
        
        public string Description;
        
        public long CreatedAt; // Unix timestamp in milliseconds
        
        public long UpdatedAt; // Last modification timestamp
        
        public string Content; // JSON string representing the editor content
        
        public string OwnerId; // Reference to user who owns this project
        
        public bool IsPublic;
        
        public string Tags; // JSON array of tags
    }

    // Component entity to store reusable components
    [SpacetimeDB.Table(Public = true)]
    public partial struct Component
    {
        [SpacetimeDB.PrimaryKey]
        public string Id;
        
        public string Name;
        
        public string Description;
        
        public string Content; // Component definition as JSON
        
        public long CreatedAt; // Unix timestamp in milliseconds
        
        public long UpdatedAt; // Last modification timestamp
        
        public bool IsPublic; // Whether this component can be used by all users
        
        public string OwnerId; // Creator of the component
        
        public int UsageCount; // How many times this component has been used
        
        public string Tags; // JSON array of tags for component categorization
    }

    // User entity
    [SpacetimeDB.Table(Public = true)]
    public partial struct User
    {
        [SpacetimeDB.PrimaryKey]
        public string Id;
        
        public string Username;
        
        public string Email;
        
        public long CreatedAt; // Unix timestamp in milliseconds
        
        public long LastLogin; // Unix timestamp in milliseconds
        
        public string PasswordHash; // Hashed password for authentication
        
        public string Salt; // Salt for password hashing
        
        public bool IsAdmin; // Whether user has admin privileges
        
        public string ProfilePictureUrl; // URL to user profile picture
        
        public string Bio; // Short user biography
        
        public string Settings; // JSON string of user settings
        
        public bool IsActive; // Whether the account is active
    }

    // Settings entity to store user preferences and app settings
    [SpacetimeDB.Table]
    public partial struct Setting
    {
        [SpacetimeDB.PrimaryKey]
        public string Id; // Usually userId_settingName format
        
        public string UserId;
        
        public string Key;
        
        public string Value; // JSON string for complex settings
        
        public long CreatedAt; // When setting was created
        
        public long UpdatedAt; // When setting was last updated
    }

    // UserProject entity - relationship between users and projects
    [SpacetimeDB.Table(Public = true)]
    public partial struct UserProject
    {
        [SpacetimeDB.PrimaryKey]
        public string Id;
        
        public string UserId; // Reference to User.Id
        
        public string ProjectId; // Reference to Project.Id
        
        public string Role; // "owner", "editor", "viewer"
        
        public long CreatedAt; // When user was given access
        
        public long LastAccessed; // When user last accessed the project
        
        public bool CanEdit; // Whether user can edit the project
        
        public bool CanShare; // Whether user can share the project
        
        public bool CanDelete; // Whether user can delete the project
    }
}
