import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

let globalCache = global.__redis;

if (!globalCache) {
    globalCache = global.__redis = {
        client: null,
        disabledLogged: false,
    };
}

function createRedisClient() {
    if (!REDIS_URL) {
        if (!globalCache.disabledLogged) {
            console.info("Redis disabled: REDIS_URL not configured");
            globalCache.disabledLogged = true;
        }
        return null;
    }

    const client = new Redis(REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        enableOfflineQueue: false,
    });

    client.on("error", (error) => {
        console.warn("Redis client error:", error.message);
    });

    return client;
}

export function getRedisClient() {
    if (globalCache.client) {
        return globalCache.client;
    }

    globalCache.client = createRedisClient();
    return globalCache.client;
}
