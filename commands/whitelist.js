// commands/whitelist.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'whitelist',
  description: 'Manage whitelisted users (owner only)',
  async execute(message, args, client) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const subcommand = args[0]?.toLowerCase();

    // Get current whitelist from env
    const ids = (process.env.WHITELIST || '').split(',').map(id => id.trim()).filter(Boolean);

    // !whitelist — show list
    if (!subcommand) {
      if (!ids.length) return message.reply('📋 Whitelist is empty.');
      const list = ids.map((id, i) => `${i + 1}. <@${id}> (${id})`).join('\n');
      return message.reply(`🛡️ **Whitelisted Users:**\n${list}\n\n✏️ To add/remove: \`!whitelist add @user\` or \`!whitelist remove @user\`\n⚠️ Then go to Railway Variables and update \`WHITELIST\` to save permanently.`);
    }

    // !whitelist add @user or ID
    if (subcommand === 'add') {
      const target = message.mentions.users.first() ||
        (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1] } : null);

      if (!target) return message.reply('❌ Usage: `!whitelist add @user` or `!whitelist add userID`');
      if (ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is already whitelisted.`);

      ids.push(target.id);
      const newWhitelist = ids.join(',');

      // Update in memory for this session
      process.env.WHITELIST = newWhitelist;

      return message.reply(
        `✅ <@${target.id}> added to whitelist for this session!\n\n` +
        `⚠️ **To make it permanent**, go to Railway → Variables → set:\n` +
        `\`WHITELIST=${newWhitelist}\``
      );
    }

    // !whitelist remove @user or ID
    if (subcommand === 'remove') {
      const target = message.mentions.users.first() ||
        (args[1] && /^\d{17,20}$/.test(args[1]) ? { id: args[1] } : null);

      if (!target) return message.reply('❌ Usage: `!whitelist remove @user` or `!whitelist remove userID`');
      if (target.id === process.env.OWNER_ID) return message.reply('❌ Cannot remove the bot owner.');
      if (!ids.includes(target.id)) return message.reply(`⚠️ <@${target.id}> is not in the whitelist.`);

      const updated = ids.filter(id => id !== target.id);
      process.env.WHITELIST = updated.join(',');

      return message.reply(
        `✅ <@${target.id}> removed from whitelist for this session!\n\n` +
        `⚠️ **To make it permanent**, go to Railway → Variables → set:\n` +
        `\`WHITELIST=${updated.join(',')}\``
      );
    }

    return message.reply(
      `🛡️ **Whitelist Commands:**\n` +
      `\`!whitelist\` — View all\n` +
      `\`!whitelist add @user\` — Add user\n` +
      `\`!whitelist remove @user\` — Remove user`
    );
  }
};
