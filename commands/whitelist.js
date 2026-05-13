// commands/whitelist.js
const fs = require('fs');
const path = require('path');

// Runtime whitelist store (persists in memory, survives command calls)
// We read from env on start, then manage in-memory + save to a JSON file
const whitelistFile = path.join(__dirname, '../whitelist.json');

function loadWhitelist() {
  try {
    if (fs.existsSync(whitelistFile)) {
      return JSON.parse(fs.readFileSync(whitelistFile, 'utf8'));
    }
  } catch {}
  // Fall back to env variable
  const envIds = (process.env.WHITELIST || '').split(',').map(id => id.trim()).filter(Boolean);
  return envIds;
}

function saveWhitelist(ids) {
  try {
    fs.writeFileSync(whitelistFile, JSON.stringify(ids, null, 2));
  } catch (err) {
    console.error('Failed to save whitelist:', err);
  }
}

module.exports = {
  name: 'whitelist',
  description: 'Manage whitelisted users (owner only)',
  async execute(message, args, client) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const subcommand = args[0]?.toLowerCase();
    const ids = loadWhitelist();

    // !whitelist — show list
    if (!subcommand) {
      if (!ids.length) return message.reply('📋 Whitelist is empty.');
      const list = ids.map((id, i) => `${i + 1}. <@${id}> (${id})`).join('\n');
      return message.reply(`🛡️ **Whitelisted Users:**\n${list}`);
    }

    // !whitelist add @user or !whitelist add userID
    if (subcommand === 'add') {
      const target = message.mentions.users.first() || 
                     (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1], tag: args[1] } : null);

      if (!target) return message.reply('❌ Please mention a user or provide their ID.\nUsage: `!whitelist add @user` or `!whitelist add 123456789`');
      if (ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is already whitelisted.`);

      ids.push(target.id);
      saveWhitelist(ids);
      return message.reply(`✅ <@${target.id}> has been added to the whitelist.`);
    }

    // !whitelist remove @user or !whitelist remove userID
    if (subcommand === 'remove') {
      const target = message.mentions.users.first() ||
                     (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1] } : null);

      if (!target) return message.reply('❌ Please mention a user or provide their ID.\nUsage: `!whitelist remove @user` or `!whitelist remove 123456789`');
      if (target.id === process.env.OWNER_ID) return message.reply('❌ You cannot remove the owner from the whitelist.');
      if (!ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is not in the whitelist.`);

      const updated = ids.filter(id => id !== target.id);
      saveWhitelist(updated);
      return message.reply(`✅ <@${target.id}> has been removed from the whitelist.`);
    }

    // !whitelist help
    return message.reply(
      `🛡️ **Whitelist Commands:**\n` +
      `\`!whitelist\` — View all whitelisted users\n` +
      `\`!whitelist add @user\` — Add a user\n` +
      `\`!whitelist remove @user\` — Remove a user`
    );
  }
};
