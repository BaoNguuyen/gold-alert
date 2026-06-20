const LOG_PREFIX = '[GoldAlert]';

function timestamp(): string {
    return new Date().toISOString();
}

export const logger = {
    info: (message: string, ...args: unknown[]): void => {
        console.log(`${LOG_PREFIX} [INFO] ${timestamp()} – ${message}`, ...args);
    },
    warn: (message: string, ...args: unknown[]): void => {
        console.warn(`${LOG_PREFIX} [WARN] ${timestamp()} – ${message}`, ...args);
    },
    error: (message: string, ...args: unknown[]): void => {
        console.error(`${LOG_PREFIX} [ERROR] ${timestamp()} – ${message}`, ...args);
    },
    debug: (message: string, ...args: unknown[]): void => {
        if (process.env['DEBUG'] === 'true') {
            console.debug(`${LOG_PREFIX} [DEBUG] ${timestamp()} – ${message}`, ...args);
        }
    },
};
