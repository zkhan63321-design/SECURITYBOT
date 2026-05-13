// utils/whitelist.js
// Manages the whitelist of trusted users who bypass security checks

require('dotenv').config();

// Load whitelist from .env + always include owner
const getWhitelist = () => {
  const ids = (process.env.WHITELIST || '').split(',').map(id => id.trim()).filter(Boolean);
  if (process.env.OWNER_ID) ids.push(process.env.OWNER_ID.trim());
  return [...new Set(ids)];
};

const isWhitelisted = (userId) => getWhitelist().includes(userId);

module.exports = { isWhitelisted, getWhitelist };
