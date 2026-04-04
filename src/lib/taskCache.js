import { getRedisClient } from "@/lib/redis";

const TASK_LIST_CACHE_KEY = "tasks:list:v1";
const DEFAULT_TTL_SECONDS = 60;

function getTtlSeconds() {
    const configured = Number(process.env.TASKS_CACHE_TTL_SECONDS);

    if (!Number.isFinite(configured) || configured <= 0) {
        return DEFAULT_TTL_SECONDS;
    }

    return Math.floor(configured);
}

export async function getCachedTaskList() {
    const redis = getRedisClient();

    if (!redis) {
        return null;
    }

    try {
        const cachedValue = await redis.get(TASK_LIST_CACHE_KEY);

        if (!cachedValue) {
            return null;
        }

        const parsed = JSON.parse(cachedValue);
        return Array.isArray(parsed) ? parsed : null;
    } catch (error) {
        console.warn("Task list cache read failed:", error.message);
        return null;
    }
}

export async function setCachedTaskList(tasks) {
    const redis = getRedisClient();

    if (!redis) {
        return;
    }

    try {
        await redis.set(
            TASK_LIST_CACHE_KEY,
            JSON.stringify(tasks),
            "EX",
            getTtlSeconds()
        );
    } catch (error) {
        console.warn("Task list cache write failed:", error.message);
    }
}

export async function invalidateTaskListCache() {
    const redis = getRedisClient();

    if (!redis) {
        return;
    }

    try {
        await redis.del(TASK_LIST_CACHE_KEY);
    } catch (error) {
        console.warn("Task list cache invalidation failed:", error.message);
    }
}
