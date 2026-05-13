// utils/whitelist.js
const fs = require('fs');
const path = require('path');

const whitelistFile = path.join(__dirname, '../whitelist.json');

function getWhitelistedIds() {
  try {
    if (fs.existsSync(whitelistFile)) {
      const ids = JSON.parse(fs.readFileSync(whitelistFile, 'utf8'));
      if (ids.length) return ids;
    }
  } catch {}
  return (process.env.WHITELIST || '').split(',').map(id => id.trim()).filter(Boolean);
}

function isWhitelisted(userId) {
  if (userId === process.env.OWNER_ID) return true;
  return getWhitelistedIds().includes(userId);
}

module.exports = { isWhitelisted, getWhitelistedIds };
