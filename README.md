# Gold Price Telegram Alert

A Node.js/TypeScript backend service that automatically monitors the gold price in Vietnam and sends a Telegram notification when the price changes significantly.

## Features

- **Automated Monitoring:** Fetches gold prices every 5 minutes (configurable).
- **Alert Rules:** Notifies you on Telegram only if the price changes by ±1% (configurable).
- **Cooldown Protection:** Prevents spamming alerts if the price keeps fluctuating within a short time window.
- **Provider:** Uses the free, public API from `vang.today` for SJC 9999 gold prices.
- **State Persistence:** Uses a lightweight local JSON file (`data/state.json`) to persist the last price and alert timestamps. No complex databases required.

## Prerequisites

- Node.js (v18 or higher recommended)
- A Telegram Bot Token (get it from [@BotFather](https://t.me/botfather))
- A Telegram Chat ID (the ID of your chat or group)

## Installation

1. **Clone or download** this repository.
2. **Install dependencies:**
    ```bash
    npm install
    ```
3. **Configure Environment:**
    - Copy the example config file:
        ```bash
        cp .env.example .env
        ```
    - Open `.env` and fill in your details:
        ```env
        TELEGRAM_BOT_TOKEN=123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        TELEGRAM_CHAT_ID=123456789
        PRICE_THRESHOLD=1
        COOLDOWN_MINUTES=30
        ```

## Usage

### Development Mode

Run the app using `ts-node` and `nodemon` for auto-reloading:
```bash
npm run dev
```

### Production Mode

Compile the TypeScript code and run the compiled output:
```bash
# Build
npm run build

# Run
npm run start
```

## Folder Structure

```
├── .env.example
├── package.json
├── tsconfig.json
├── data/                 # Auto-generated. Stores state.json
├── src/
│   ├── config/           # Environment and app config
│   ├── jobs/             # Node-cron background jobs
│   ├── services/         # Core business logic (Storage, GoldPrice, Telegram API)
│   ├── types/            # TypeScript interfaces
│   ├── utils/            # Shared utilities (Logger)
│   └── index.ts          # Application entry point
```

## Customizing the Provider

To change the gold price data provider, simply modify `src/services/goldPrice.service.ts`. The codebase is designed so that you only need to update the `fetchRaw` and `normalize` functions inside this single module.
