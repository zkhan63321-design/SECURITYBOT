// commands/whitelist.js
const fs = require('fs');
const path = require('path');
const { getWhitelistedIds } = require('../utils/whitelist');

const whitelistFile = path.join(__dirname, '../whitelist.json');

function saveWhitelist(ids) {
  fs.writeFileSync(whitelistFile, JSON.stringify(ids, null, 2));
}

module.exports = {
  name: 'whitelist',
  description: 'Manage whitelisted users (owner only)',
  async execute(message, args, client) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const subcommand = args[0]?.toLowerCase();
    const ids = getWhitelistedIds();

    // !whitelist — show list
    if (!subcommand) {
      if (!ids.length) return message.reply('📋 Whitelist is empty.');
      const list = ids.map((id, i) => `${i + 1}. <@${id}> (${id})`).join('\n');
      return message.reply(`🛡️ **Whitelisted Users:**\n${list}`);
    }

    // !whitelist add @user or ID
    if (subcommand === 'add') {
      const target = message.mentions.users.first() ||
        (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1], username: args[1] } : null);

      if (!target) return message.reply('❌ Usage: `!whitelist add @user` or `!whitelist add userID`');
      if (ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is already whitelisted.`);

      ids.push(target.id);
      saveWhitelist(ids);
      return message.reply(`✅ <@${target.id}> has been added to the whitelist.`);
    }

    // !whitelist remove @user or ID
    if (subcommand === 'remove') {
      const target = message.mentions.users.first() ||
        (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1] } : null);

      if (!target) return message.reply('❌ Usage: `!whitelist remove @user` or `!whitelist remove userID`');
      if (target.id === process.env.OWNER_ID) return message.reply('❌ Cannot remove the bot owner.');
      if (!ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is not in the whitelist.`);

      saveWhitelist(ids.filter(id => id !== target.id));
      return message.reply(`✅ <@${target.id}> has been removed from the whitelist.`);
    }

    return message.reply(
      `🛡️ **Whitelist Commands:**\n` +
      `\`!whitelist\` — View all\n` +
      `\`!whitelist add @user\` — Add user\n` +
      `\`!whitelist remove @user\` — Remove user`
    );
  }
};
