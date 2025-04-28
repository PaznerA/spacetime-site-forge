using SpacetimeDB;
using System;
using System.Linq;

// Project reducery v samostatném souboru
public static partial class Module
{
    [SpacetimeDB.Reducer]
    public static void CreateProject(ReducerContext ctx, string name, string description, string ownerId, string? initialContent = null, bool isPublic = false, string tags = "[]")
    {
        var projectId = Guid.NewGuid().ToString();
        var now = GetCurrentTimestamp();
        
        var content = initialContent ?? "{\"nodes\":{},\"root\":{\"type\":\"div\",\"isCanvas\":true,\"props\":{\"className\":\"h-full w-full p-4\"},\"nodes\":[]}}";
        
        var project = new Project 
        { 
            Id = projectId,
            Name = name,
            Description = description,
            CreatedAt = now,
            UpdatedAt = now,
            Content = content,
            OwnerId = ownerId,
            IsPublic = isPublic,
            Tags = tags,
        };
        
        var inserted = ctx.Db.Project.Insert(project);
        
        // Create a UserProject connection
        var userProject = new UserProject
        {
            Id = Guid.NewGuid().ToString(),
            UserId = ownerId,
            ProjectId = projectId,
            Role = "owner",
            CreatedAt = now,
            LastAccessed = now,
            CanEdit = true,
            CanShare = true,
            CanDelete = true,
        };
        
        ctx.Db.UserProject.Insert(userProject);
        
        Log.Info($"Created project {inserted.Name} with ID {inserted.Id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateProject(ReducerContext ctx, string id, string name, string description, string content, bool isPublic = false, string tags = "[]")
    {
        var now = GetCurrentTimestamp();
        var projectOpt = ctx.Db.Project.Iter().FirstOrDefault(p => p.Id == id);
        
        if (projectOpt.Equals(default(Project)))
        {
            throw new Exception($"Project with ID {id} not found");
        }
        
        // Create updated version
        var updatedProject = new Project
        {
            Id = id,
            Name = name,
            Description = description,
            Content = content,
            CreatedAt = projectOpt.CreatedAt,
            UpdatedAt = now,
            OwnerId = projectOpt.OwnerId,
            IsPublic = isPublic,
            Tags = tags,
        };
        
        // Remove old version
        foreach (var project in ctx.Db.Project.Iter().Where(p => p.Id == id))
        {
            ctx.Db.Project.Delete(project);
        }
        
        // Insert updated version
        var inserted = ctx.Db.Project.Insert(updatedProject);
        Log.Info($"Updated project {inserted.Name} with ID {inserted.Id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteProject(ReducerContext ctx, string id)
    {
        bool found = false;
        
        foreach (var project in ctx.Db.Project.Iter().Where(p => p.Id == id))
        {
            ctx.Db.Project.Delete(project);
            found = true;
        }
        
        if (!found)
        {
            throw new Exception($"Project with ID {id} not found");
        }
        
        // Also delete all UserProject connections for this project
        foreach (var userProject in ctx.Db.UserProject.Iter().Where(up => up.ProjectId == id))
        {
            ctx.Db.UserProject.Delete(userProject);
        }
        
        Log.Info($"Deleted project with ID {id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void ShareProject(ReducerContext ctx, string projectId, string userId, string role, bool canEdit, bool canShare, bool canDelete)
    {
        var now = GetCurrentTimestamp();
        
        // Check if project exists
        var projectExists = ctx.Db.Project.Iter().Any(p => p.Id == projectId);
        if (!projectExists)
        {
            throw new Exception($"Project with ID {projectId} not found");
        }
        
        // Check if user exists
        var userExists = ctx.Db.User.Iter().Any(u => u.Id == userId);
        if (!userExists)
        {
            throw new Exception($"User with ID {userId} not found");
        }
        
        // Check if sharing already exists
        var existingSharing = ctx.Db.UserProject.Iter()
            .FirstOrDefault(up => up.ProjectId == projectId && up.UserId == userId);
            
        if (!existingSharing.Equals(default(UserProject)))
        {
            // Update existing sharing
            foreach (var up in ctx.Db.UserProject.Iter().Where(up => up.ProjectId == projectId && up.UserId == userId))
            {
                ctx.Db.UserProject.Delete(up);
            }
        }
        
        // Create new sharing
        var userProject = new UserProject
        {
            Id = Guid.NewGuid().ToString(),
            UserId = userId,
            ProjectId = projectId,
            Role = role,
            CreatedAt = now,
            LastAccessed = now,
            CanEdit = canEdit,
            CanShare = canShare,
            CanDelete = canDelete,
        };
        
        ctx.Db.UserProject.Insert(userProject);
        Log.Info($"Shared project {projectId} with user {userId}");
    }
    
    [SpacetimeDB.Reducer]
    public static void RemoveUserFromProject(ReducerContext ctx, string projectId, string userId)
    {
        bool found = false;
        
        foreach (var up in ctx.Db.UserProject.Iter().Where(up => up.ProjectId == projectId && up.UserId == userId))
        {
            ctx.Db.UserProject.Delete(up);
            found = true;
        }
        
        if (!found)
        {
            throw new Exception($"User {userId} does not have access to project {projectId}");
        }
        
        Log.Info($"Removed user {userId} from project {projectId}");
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateLastProjectAccess(ReducerContext ctx, string projectId, string userId)
    {
        var now = GetCurrentTimestamp();
        var exists = false;
        
        foreach (var up in ctx.Db.UserProject.Iter().Where(up => up.ProjectId == projectId && up.UserId == userId))
        {
            ctx.Db.UserProject.Delete(up);
            
            var updated = new UserProject
            {
                Id = up.Id,
                UserId = up.UserId,
                ProjectId = up.ProjectId,
                Role = up.Role,
                CreatedAt = up.CreatedAt,
                LastAccessed = now,
                CanEdit = up.CanEdit,
                CanShare = up.CanShare,
                CanDelete = up.CanDelete,
            };
            
            ctx.Db.UserProject.Insert(updated);
            exists = true;
        }
        
        if (!exists)
        {
            Log.Info($"User {userId} has no access to project {projectId}");
        }
    }
}
