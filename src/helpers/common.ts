// eslint-disable-next-line no-promise-executor-return
export const delay = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

export const formatDuration = (rawMs: number): string => {
    const ms = Math.abs(rawMs);

    const time = {
        day: Math.floor(ms / 86400000),
        hour: Math.floor(ms / 3600000) % 24,
        minute: Math.floor(ms / 60000) % 60,
        second: Math.floor(ms / 1000) % 60,
        millisecond: Math.floor(ms) % 1000,
    };

    return Object.entries(time)
        .filter(val => val[1] !== 0)
        .map(([key, val]) => `${val} ${key}${val !== 1 ? 's' : ''}`)
        .join(', ');
};
