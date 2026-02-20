// Currency conversion utilities
export const COINS_TO_PKR_RATE = 100; // 100 coins = 1 PKR

export const coinsToPKR = (coins) => {
  return (coins / COINS_TO_PKR_RATE).toFixed(2);
};

export const pkrToCoins = (pkr) => {
  return Math.round(pkr * COINS_TO_PKR_RATE);
};

export const formatCurrency = (coins, showBoth = true) => {
  if (showBoth) {
    return `${coins} coins (₨${coinsToPKR(coins)})`;
  }
  return `₨${coinsToPKR(coins)}`;
};