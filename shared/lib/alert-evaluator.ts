import type { Database } from "@/shared/api/supabase.types";
import type { AssetPrice } from "@/shared/api/coingecko";

type Alert = Database["public"]["Tables"]["alerts"]["Row"];

/**
 * Returns true if the alert condition is met by the current price data.
 */
export function evaluateAlert(alert: Alert, price: AssetPrice): boolean {
  if (alert.type === "threshold") {
    if (alert.condition === "above") return price.usd >= alert.value;
    if (alert.condition === "below") return price.usd <= alert.value;
  }

  if (alert.type === "percent_change") {
    const change = price.usd_24h_change;
    if (alert.condition === "above") return change >= alert.value;
    if (alert.condition === "below") return change <= -Math.abs(alert.value);
  }

  return false;
}

/**
 * Returns true if the alert is within its cooldown window.
 */
export function isInCooldown(alert: Alert): boolean {
  if (!alert.last_triggered_at) return false;
  const last = new Date(alert.last_triggered_at).getTime();
  const cooldownMs = alert.cooldown_minutes * 60 * 1000;
  return Date.now() - last < cooldownMs;
}

export function formatAlertMessage(
  assetName: string,
  assetSymbol: string,
  alert: Alert,
  price: AssetPrice
): string {
  const priceStr = `$${price.usd.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  const changeStr = `${price.usd_24h_change >= 0 ? "+" : ""}${price.usd_24h_change.toFixed(2)}%`;

  if (alert.type === "threshold") {
    const dir = alert.condition === "above" ? "surpassed" : "dropped below";
    return (
      `🔔 <b>${assetName} (${assetSymbol.toUpperCase()})</b> alert!\n\n` +
      `Price has ${dir} $${alert.value.toLocaleString()}\n` +
      `Current price: <b>${priceStr}</b>\n` +
      `24h change: ${changeStr}`
    );
  }

  const dir = alert.condition === "above" ? "up" : "down";
  return (
    `📈 <b>${assetName} (${assetSymbol.toUpperCase()})</b> alert!\n\n` +
    `Price is ${dir} ${Math.abs(alert.value)}%+ in 24h\n` +
    `24h change: <b>${changeStr}</b>\n` +
    `Current price: ${priceStr}`
  );
}
