using SpacetimeDB;
using System;
using System.Linq;

// Setting reducery v samostatném souboru
public static partial class Module
{
    [SpacetimeDB.Reducer]
    public static void SetSetting(ReducerContext ctx, string userId, string key, string value)
    {
        var now = GetCurrentTimestamp();
        var id = $"{userId}_{key}";
        var existingSettingOpt = ctx.Db.Setting.Iter().FirstOrDefault(s => s.Id == id);
        
        if (!existingSettingOpt.Equals(default(Setting)))
        {
            // Remove existing setting
            foreach (var setting in ctx.Db.Setting.Iter().Where(s => s.Id == id))
            {
                ctx.Db.Setting.Delete(setting);
            }
        }
        
        // Create new or updated setting
        var newSetting = new Setting
        {
            Id = id,
            UserId = userId,
            Key = key,
            Value = value,
            CreatedAt = existingSettingOpt.Equals(default(Setting)) ? now : existingSettingOpt.CreatedAt,
            UpdatedAt = now,
        };
        
        var inserted = ctx.Db.Setting.Insert(newSetting);
        Log.Info($"{(existingSettingOpt.Equals(default(Setting)) ? "Created" : "Updated")} setting {key} for user {userId}");
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteSetting(ReducerContext ctx, string userId, string key)
    {
        var id = $"{userId}_{key}";
        bool found = false;
        
        foreach (var setting in ctx.Db.Setting.Iter().Where(s => s.Id == id))
        {
            ctx.Db.Setting.Delete(setting);
            found = true;
        }
        
        if (found)
        {
            Log.Info($"Deleted setting {key} for user {userId}");
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void DeleteAllUserSettings(ReducerContext ctx, string userId)
    {
        int count = 0;
        
        foreach (var setting in ctx.Db.Setting.Iter().Where(s => s.UserId == userId))
        {
            ctx.Db.Setting.Delete(setting);
            count++;
        }
        
        if (count > 0)
        {
            Log.Info($"Deleted {count} settings for user {userId}");
        }
    }
    
    [SpacetimeDB.Reducer]
    public static void CopyUserSettings(ReducerContext ctx, string sourceUserId, string targetUserId)
    {
        var now = GetCurrentTimestamp();
        int count = 0;
        
        foreach (var setting in ctx.Db.Setting.Iter().Where(s => s.UserId == sourceUserId))
        {
            var targetId = $"{targetUserId}_{setting.Key}";
            
            // Delete any existing setting with the same key for target user
            foreach (var existingSetting in ctx.Db.Setting.Iter().Where(s => s.Id == targetId))
            {
                ctx.Db.Setting.Delete(existingSetting);
            }
            
            // Create new setting for target user
            var newSetting = new Setting
            {
                Id = targetId,
                UserId = targetUserId,
                Key = setting.Key,
                Value = setting.Value,
                CreatedAt = now,
                UpdatedAt = now,
            };
            
            ctx.Db.Setting.Insert(newSetting);
            count++;
        }
        
        if (count > 0)
        {
            Log.Info($"Copied {count} settings from user {sourceUserId} to user {targetUserId}");
        }
        else
        {
            Log.Info($"No settings found to copy from user {sourceUserId}");
        }
    }
}
