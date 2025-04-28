using SpacetimeDB;
using System;
using System.Linq;

// Component reducery v samostatném souboru
public static partial class Module
{
    [SpacetimeDB.Reducer]
    public static void CreateComponent(ReducerContext ctx, string name, string description, string content, string ownerId, bool isPublic = false, string tags = "[]")
    {
        var componentId = Guid.NewGuid().ToString();
        var now = GetCurrentTimestamp();
        
        var component = new Component
        {
            Id = componentId,
            Name = name,
            Description = description,
            Content = content,
            CreatedAt = now,
            UpdatedAt = now,
            IsPublic = isPublic,
            OwnerId = ownerId,
            UsageCount = 0,
            Tags = tags,
        };
        
        var inserted = ctx.Db.Component.Insert(component);
        Log.Info($"Created component {inserted.Name} with ID {inserted.Id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void UpdateComponent(ReducerContext ctx, string id, string name, string description, string content, bool isPublic = false, string tags = "[]")
    {
        var now = GetCurrentTimestamp();
        var componentOpt = ctx.Db.Component.Iter().FirstOrDefault(c => c.Id == id);
        
        if (componentOpt.Equals(default(Component)))
        {
            throw new Exception($"Component with ID {id} not found");
        }
        
        // Create updated version
        var updatedComponent = new Component
        {
            Id = id,
            Name = name,
            Description = description,
            Content = content,
            CreatedAt = componentOpt.CreatedAt,
            UpdatedAt = now,
            IsPublic = isPublic,
            OwnerId = componentOpt.OwnerId,
            UsageCount = componentOpt.UsageCount,
            Tags = tags,
        };
        
        // Remove old version
        foreach (var component in ctx.Db.Component.Iter().Where(c => c.Id == id))
        {
            ctx.Db.Component.Delete(component);
        }
        
        // Insert updated version
        var inserted = ctx.Db.Component.Insert(updatedComponent);
        Log.Info($"Updated component {inserted.Name} with ID {inserted.Id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteComponentById(ReducerContext ctx, string id)
    {
        bool found = false;
        
        foreach (var component in ctx.Db.Component.Iter().Where(c => c.Id == id))
        {
            ctx.Db.Component.Delete(component);
            found = true;
        }
        
        if (!found)
        {
            throw new Exception($"Component with ID {id} not found");
        }
        
        Log.Info($"Deleted component with ID {id}");
    }
    
    [SpacetimeDB.Reducer]
    public static void IncrementComponentUsage(ReducerContext ctx, string id)
    {
        var componentOpt = ctx.Db.Component.Iter().FirstOrDefault(c => c.Id == id);
        
        if (componentOpt.Equals(default(Component)))
        {
            throw new Exception($"Component with ID {id} not found");
        }
        
        foreach (var component in ctx.Db.Component.Iter().Where(c => c.Id == id))
        {
            ctx.Db.Component.Delete(component);
        }
        
        var updatedComponent = new Component
        {
            Id = componentOpt.Id,
            Name = componentOpt.Name,
            Description = componentOpt.Description,
            Content = componentOpt.Content,
            CreatedAt = componentOpt.CreatedAt,
            UpdatedAt = componentOpt.UpdatedAt,
            IsPublic = componentOpt.IsPublic,
            OwnerId = componentOpt.OwnerId,
            UsageCount = componentOpt.UsageCount + 1,
            Tags = componentOpt.Tags,
        };
        
        ctx.Db.Component.Insert(updatedComponent);
        Log.Info($"Incremented usage count for component {componentOpt.Name}");
    }
    
    [SpacetimeDB.Reducer]
    public static void CloneComponent(ReducerContext ctx, string sourceId, string newName, string newDescription, string newOwnerId)
    {
        var now = GetCurrentTimestamp();
        var componentOpt = ctx.Db.Component.Iter().FirstOrDefault(c => c.Id == sourceId);
        
        if (componentOpt.Equals(default(Component)))
        {
            throw new Exception($"Component with ID {sourceId} not found");
        }
        
        // Check if component is public or user is owner
        if (!componentOpt.IsPublic && componentOpt.OwnerId != newOwnerId)
        {
            throw new Exception("Cannot clone private component owned by another user");
        }
        
        var newComponent = new Component
        {
            Id = Guid.NewGuid().ToString(),
            Name = newName,
            Description = newDescription,
            Content = componentOpt.Content,
            CreatedAt = now,
            UpdatedAt = now,
            IsPublic = false, // Default to private for cloned component
            OwnerId = newOwnerId,
            UsageCount = 0,
            Tags = componentOpt.Tags,
        };
        
        var inserted = ctx.Db.Component.Insert(newComponent);
        
        // Increment original component usage
        IncrementComponentUsage(ctx, sourceId);
        
        Log.Info($"Cloned component {componentOpt.Name} to {newName}");
    }
}
