import axios from 'axios';
import { GoldPrice } from '../types';
import { logger } from '../utils/logger';

// ─────────────────────────────────────────────────────────────────────────────
// Gold price provider: vang.today (Free public API, no auth required)
// Docs: https://www.vang.today
// Type "SJL1L10" = SJC 9999 (1 lượng / 10 chỉ / 1 kg standard bar)
// Prices are in VND per lượng, updated every 5 minutes.
// To swap providers: replace fetchRaw() and normalize() below.
// ─────────────────────────────────────────────────────────────────────────────

const PROVIDER_NAME = 'vang.today';
const API_URL = 'https://www.vang.today/api/prices';
const GOLD_TYPE = 'SJL1L10'; // SJC 9999
const REQUEST_TIMEOUT_MS = 10_000;

interface VangTodayResponse {
    success: boolean;
    timestamp: number;
    time: string;
    date: string;
    type: string;
    name: string;
    buy: number;
    sell: number;
    change_buy: number;
    change_sell: number;
}

async function fetchRaw(): Promise<VangTodayResponse> {
    const response = await axios.get<VangTodayResponse>(API_URL, {
        params: { type: GOLD_TYPE },
        timeout: REQUEST_TIMEOUT_MS,
        headers: {
            'Accept': 'application/json',
            'User-Agent': 'GoldPriceTelegramAlert/1.0',
        },
    });
    return response.data;
}

function normalize(raw: VangTodayResponse): GoldPrice {
    if (!raw.success) {
        throw new Error('vang.today API returned success=false');
    }
    const price = raw.sell;
    if (!price || price <= 0) {
        throw new Error(`Invalid sell price from vang.today: ${price}`);
    }
    return {
        price,
        unit: 'VND/lượng',
        fetchedAt: new Date().toISOString(),
        source: `${PROVIDER_NAME} (${raw.name})`,
    };
}

export async function fetchGoldPrice(): Promise<GoldPrice> {
    logger.info(`Fetching gold price from ${PROVIDER_NAME}...`);
    try {
        const raw = await fetchRaw();
        const normalized = normalize(raw);
        logger.info(`Gold price fetched: ${normalized.price.toLocaleString('vi-VN')} ${normalized.unit}`);
        return normalized;
    } catch (err) {
        logger.error('Failed to fetch gold price.', err instanceof Error ? err.message : err);
        throw err;
    }
}
