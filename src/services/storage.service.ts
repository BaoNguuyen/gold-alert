import fs from 'fs';
import path from 'path';
import { AppState, HistoryPoint } from '../types';
import { config } from '../config';
import { logger } from '../utils/logger';

const DEFAULT_STATE: AppState = {
    lastPrice: null,
    lastAlertAt: null,
    lastAlertDirection: null,
};

function ensureDir(filePath: string): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

export function loadState(): AppState {
    const filePath = config.storage.filePath;
    try {
        if (!fs.existsSync(filePath)) {
            logger.info('State file not found, starting with default state.');
            return { ...DEFAULT_STATE };
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw) as Partial<AppState>;
        return {
            lastPrice: parsed.lastPrice ?? null,
            lastAlertAt: parsed.lastAlertAt ?? null,
            lastAlertDirection: parsed.lastAlertDirection ?? null,
        };
    } catch (err) {
        logger.error('Failed to load state, using default.', err);
        return { ...DEFAULT_STATE };
    }
}

export function saveState(state: AppState): void {
    const filePath = config.storage.filePath;
    try {
        ensureDir(filePath);
        fs.writeFileSync(filePath, JSON.stringify(state, null, 2), 'utf-8');
        logger.debug('State saved successfully.');
    } catch (err) {
        logger.error('Failed to save state.', err);
    }
}

export function loadHistory(): HistoryPoint[] {
    const filePath = config.storage.historyPath;
    try {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as HistoryPoint[];
    } catch (err) {
        logger.error('Failed to load history, returning empty array.', err);
        return [];
    }
}

export function saveHistory(history: HistoryPoint[]): void {
    const filePath = config.storage.historyPath;
    try {
        ensureDir(filePath);
        // Only keep the last 168 hours (7 days) of data
        const pruned = history.slice(-168);
        fs.writeFileSync(filePath, JSON.stringify(pruned, null, 2), 'utf-8');
        logger.debug(`History saved successfully with ${pruned.length} entries.`);
    } catch (err) {
        logger.error('Failed to save history.', err);
    }
}
