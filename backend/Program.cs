using System;
using SpaceTimeDB;
using SpaceTimeDB.Attributes;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace WebEditorBackend
{
    // Project entity to store project information
    [Table]
    public class Project
    {
        [Column(PrimaryKey = true)]
        public string Id { get; set; }
        
        [Column(Indexed = true)]
        public string Name { get; set; }
        
        [Column]
        public string? Description { get; set; }
        
        [Column]
        public DateTime CreatedAt { get; set; }
        
        [Column]
        public string Content { get; set; } // JSON string representing the editor content
        
        [Column]
        public string OwnerId { get; set; } // Reference to client who owns this project
    }

    // Component entity to store reusable components
    [Table]
    public class Component
    {
        [Column(PrimaryKey = true)]
        public string Id { get; set; }
        
        [Column(Indexed = true)]
        public string Name { get; set; }
        
        [Column]
        public string Description { get; set; }
        
        [Column]
        public string Content { get; set; } // Component definition as JSON
        
        [Column]
        public DateTime CreatedAt { get; set; }
        
        [Column]
        public bool IsPublic { get; set; } // Whether this component can be used by all users
        
        [Column]
        public string OwnerId { get; set; } // Creator of the component
    }

    // Client entity to store user/client information
    [Table]
    public class Client
    {
        [Column(PrimaryKey = true)]
        public string Id { get; set; }
        
        [Column(Indexed = true)]
        public string Username { get; set; }
        
        [Column]
        public string Email { get; set; }
        
        [Column]
        public DateTime CreatedAt { get; set; }
        
        [Column]
        public DateTime LastLogin { get; set; }
    }

    // Settings entity to store user preferences and app settings
    [Table]
    public class Setting
    {
        [Column(PrimaryKey = true)]
        public string Id { get; set; } // Usually userId_settingName format
        
        [Column(Indexed = true)]
        public string UserId { get; set; }
        
        [Column]
        public string Key { get; set; }
        
        [Column]
        public string Value { get; set; } // JSON string for complex settings
    }

    public static class Reducers
    {
        // Project Reducers
        [Reducer]
        public static Project CreateProject(string name, string description, string ownerId, string? initialContent = null)
        {
            var projectId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;
            
            var content = initialContent ?? "{\"nodes\":{},\"root\":{\"type\":\"div\",\"isCanvas\":true,\"props\":{\"className\":\"h-full w-full p-4\"},\"nodes\":[]}}";
            
            var project = new Project
            {
                Id = projectId,
                Name = name,
                Description = description,
                CreatedAt = now,
                Content = content,
                OwnerId = ownerId
            };
            
            SpaceTimeDB.Insert(project);
            return project;
        }
        
        [Reducer]
        public static Project UpdateProject(string id, string name, string description, string content)
        {
            var project = SpaceTimeDB.One<Project>(p => p.Id == id);
            
            if (project == null)
            {
                throw new Exception($"Project with ID {id} not found");
            }
            
            project.Name = name;
            project.Description = description;
            project.Content = content;
            
            SpaceTimeDB.Update(project);
            return project;
        }
        
        [Reducer]
        public static void DeleteProject(string id)
        {
            var project = SpaceTimeDB.One<Project>(p => p.Id == id);
            
            if (project == null)
            {
                throw new Exception($"Project with ID {id} not found");
            }
            
            SpaceTimeDB.Delete(project);
        }
        
        // Component Reducers
        [Reducer]
        public static Component CreateComponent(string name, string description, string content, string ownerId, bool isPublic = false)
        {
            var componentId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;
            
            var component = new Component
            {
                Id = componentId,
                Name = name,
                Description = description,
                Content = content,
                CreatedAt = now,
                IsPublic = isPublic,
                OwnerId = ownerId
            };
            
            SpaceTimeDB.Insert(component);
            return component;
        }
        
        [Reducer]
        public static Component UpdateComponent(string id, string name, string description, string content, bool isPublic)
        {
            var component = SpaceTimeDB.One<Component>(c => c.Id == id);
            
            if (component == null)
            {
                throw new Exception($"Component with ID {id} not found");
            }
            
            component.Name = name;
            component.Description = description;
            component.Content = content;
            component.IsPublic = isPublic;
            
            SpaceTimeDB.Update(component);
            return component;
        }
        
        [Reducer]
        public static void DeleteComponent(string id)
        {
            var component = SpaceTimeDB.One<Component>(c => c.Id == id);
            
            if (component == null)
            {
                throw new Exception($"Component with ID {id} not found");
            }
            
            SpaceTimeDB.Delete(component);
        }
        
        // Client Reducers
        [Reducer]
        public static Client CreateClient(string username, string email)
        {
            var clientId = Guid.NewGuid().ToString();
            var now = DateTime.UtcNow;
            
            var client = new Client
            {
                Id = clientId,
                Username = username,
                Email = email,
                CreatedAt = now,
                LastLogin = now
            };
            
            SpaceTimeDB.Insert(client);
            return client;
        }
        
        [Reducer]
        public static Client UpdateClient(string id, string username, string email)
        {
            var client = SpaceTimeDB.One<Client>(c => c.Id == id);
            
            if (client == null)
            {
                throw new Exception($"Client with ID {id} not found");
            }
            
            client.Username = username;
            client.Email = email;
            
            SpaceTimeDB.Update(client);
            return client;
        }
        
        [Reducer]
        public static Client UpdateLastLogin(string id)
        {
            var client = SpaceTimeDB.One<Client>(c => c.Id == id);
            
            if (client == null)
            {
                throw new Exception($"Client with ID {id} not found");
            }
            
            client.LastLogin = DateTime.UtcNow;
            
            SpaceTimeDB.Update(client);
            return client;
        }
        
        // Settings Reducers
        [Reducer]
        public static Setting SetSetting(string userId, string key, string value)
        {
            var id = $"{userId}_{key}";
            var existingSetting = SpaceTimeDB.One<Setting>(s => s.Id == id);
            
            if (existingSetting != null)
            {
                existingSetting.Value = value;
                SpaceTimeDB.Update(existingSetting);
                return existingSetting;
            }
            else
            {
                var setting = new Setting
                {
                    Id = id,
                    UserId = userId,
                    Key = key,
                    Value = value
                };
                
                SpaceTimeDB.Insert(setting);
                return setting;
            }
        }
        
        [Reducer]
        public static void DeleteSetting(string userId, string key)
        {
            var id = $"{userId}_{key}";
            var setting = SpaceTimeDB.One<Setting>(s => s.Id == id);
            
            if (setting != null)
            {
                SpaceTimeDB.Delete(setting);
            }
        }
    }

    class Program
    {
        static async Task Main(string[] args)
        {
            // Initialize SpaceTimeDB Module
            var module = new WebEditorBackendModule();
            
            // Register tables with SpaceTimeDB
            module.RegisterTables();
            
            // Register reducers with SpaceTimeDB
            module.RegisterReducers();
            
            // Start the SpaceTimeDB instance
            await module.Run();
        }
    }

    // Module class for SpaceTimeDB
    public class WebEditorBackendModule : SpaceTimeDBModule
    {
        public override void RegisterTables()
        {
            // Register all database tables
            Database.RegisterTable<Project>();
            Database.RegisterTable<Component>();
            Database.RegisterTable<Client>();
            Database.RegisterTable<Setting>();
            
            Console.WriteLine("Tables registered successfully!");
        }

        public override void RegisterReducers()
        {
            // Register all reducers
            AddReducerClass(typeof(Reducers));
            Console.WriteLine("Reducers registered successfully!");
        }

        public override async Task Run()
        {
            Console.WriteLine("SpaceTimeDB Web Editor Backend started!");
            Console.WriteLine("Press Ctrl+C to exit.");
            
            // Keep the process alive
            var tcs = new TaskCompletionSource<bool>();
            Console.CancelKeyPress += (s, e) => 
            {
                e.Cancel = true;
                tcs.SetResult(true);
            };
            
            await tcs.Task;
        }
    }
}
