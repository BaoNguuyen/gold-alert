export interface GoldPrice {
    price: number;        // price in VND or USD per tael/oz
    unit: string;         // e.g. "VND/tael" or "USD/oz"
    fetchedAt: string;    // ISO timestamp
    source: string;       // data provider name
}

export interface AppState {
    lastPrice: GoldPrice | null;
    lastAlertAt: string | null;   // ISO timestamp of last alert sent
    lastAlertDirection: 'UP' | 'DOWN' | null;
}

export type AlertDirection = 'UP' | 'DOWN';

export interface AlertPayload {
    currentPrice: GoldPrice;
    previousPrice: GoldPrice;
    percentChange: number;
    direction: AlertDirection;
}

export interface HistoryPoint {
    timestamp: string; // ISO timestamp
    price: number;
}
