/**
 * Live market strip for the wire ticker — the v4 design interleaves prices
 * between scam alerts. Prices are REAL (CoinGecko, keyless, cached 5 min);
 * the design file's hardcoded values were mock data and using them would
 * violate the honest-numbers law. On any failure we return [] and the ticker
 * simply runs without prices — never stale fakes.
 */

export type PriceItem = {
  sym: string;
  px: string;
  chg: string;
  up: boolean;
};

const COINS: Array<[id: string, sym: string]> = [
  ["bitcoin", "BTC"],
  ["ethereum", "ETH"],
  ["solana", "SOL"],
  ["ripple", "XRP"],
  ["binancecoin", "BNB"],
  ["dogecoin", "DOGE"],
  ["cardano", "ADA"],
  ["chainlink", "LINK"],
];

function fmtUsd(v: number): string {
  if (v >= 1000) {
    return `$${Math.round(v).toLocaleString("en-US")}`;
  }
  if (v >= 1) return `$${v.toFixed(2)}`;
  return `$${v.toFixed(4)}`;
}

export async function fetchPrices(): Promise<PriceItem[]> {
  try {
    const ids = COINS.map(([id]) => id).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      {
        next: { revalidate: 300 },
        headers: { "User-Agent": "BTCSCAM/1.0 (contact@btcscam.com)" },
      },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Record<
      string,
      { usd?: number; usd_24h_change?: number }
    >;
    const out: PriceItem[] = [];
    for (const [id, sym] of COINS) {
      const row = data[id];
      if (!row || typeof row.usd !== "number") continue;
      const chg = row.usd_24h_change ?? 0;
      out.push({
        sym,
        px: fmtUsd(row.usd),
        chg: `${chg >= 0 ? "+" : "−"}${Math.abs(chg).toFixed(2)}%`,
        up: chg >= 0,
      });
    }
    return out;
  } catch {
    return [];
  }
}
