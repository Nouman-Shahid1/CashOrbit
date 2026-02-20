// Coin conversion utility
// Standard rate: 100 coins = 1 PKR

const COINS_PER_PKR = 100;

/**
 * Convert coins to PKR
 * @param {number} coins - Number of coins
 * @returns {number} PKR amount (rounded down)
 */
const coinsToPKR = (coins) => {
  return Math.floor(coins / COINS_PER_PKR);
};

/**
 * Convert PKR to coins
 * @param {number} pkr - PKR amount
 * @returns {number} Number of coins required
 */
const pkrToCoins = (pkr) => {
  return pkr * COINS_PER_PKR;
};

/**
 * Check if user has enough coins for PKR amount
 * @param {number} userCoins - User's current coins
 * @param {number} pkrAmount - Required PKR amount
 * @returns {boolean} Whether user has enough coins
 */
const hasEnoughCoins = (userCoins, pkrAmount) => {
  return userCoins >= pkrToCoins(pkrAmount);
};

module.exports = {
  COINS_PER_PKR,
  coinsToPKR,
  pkrToCoins,
  hasEnoughCoins
};