// Create database and collections
db = db.getSiblingDB('srt8192');

// Create collections with schemas
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["username", "email", "createdAt"],
            properties: {
                username: {
                    bsonType: "string",
                    description: "Username must be a string and is required"
                },
                email: {
                    bsonType: "string",
                    pattern: "^.+@.+$",
                    description: "Email must be a valid email address and is required"
                },
                createdAt: {
                    bsonType: "date",
                    description: "Creation timestamp must be a date and is required"
                }
            }
        }
    }
});

db.createCollection('games', {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["status", "createdAt", "players"],
            properties: {
                status: {
                    enum: ["pending", "active", "completed"],
                    description: "Game status must be one of: pending, active, completed"
                },
                createdAt: {
                    bsonType: "date",
                    description: "Creation timestamp must be a date"
                },
                players: {
                    bsonType: "array",
                    description: "Array of player references"
                }
            }
        }
    }
});

// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.games.createIndex({ "status": 1, "createdAt": -1 });

// Create admin user if not exists
if (db.getUser("srt8192_admin") == null) {
    db.createUser({
        user: "srt8192_admin",
        pwd: "development_password_only",  // Should be overridden in production
        roles: ["readWrite", "dbAdmin"]
    });
}

// Initialize some configuration data
db.gameConfig.insertMany([
    {
        type: "resources",
        config: {
            startingEnergy: 1000,
            startingMaterials: 500,
            energyRegenerationRate: 10,
            materialExtractionRate: 5
        }
    },
    {
        type: "gameplay",
        config: {
            maxPlayersPerGame: 4,
            turnTimeLimit: 300,
            maxTurns: 8192
        }
    }
]);