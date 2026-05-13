// commands/whitelist.js
// Owner-only command to view the whitelist

require('dotenv').config();

module.exports = {
  name: 'whitelist',
  description: 'Show the current whitelist (owner only)',
  async execute(message, args, client) {
    if (message.author.id !== process.env.OWNER_ID) {
      return message.reply('❌ Only the bot owner can use this command.');
    }

    const ids = (process.env.WHITELIST || '').split(',').map(id => id.trim()).filter(Boolean);
    if (!ids.length) {
      return message.reply('📋 The whitelist is empty (only owner is protected by default).');
    }

    const list = ids.map((id, i) => `${i + 1}. <@${id}> (${id})`).join('\n');
    message.reply(`🛡️ **Whitelisted Users:**\n${list}\n\nEdit the \`.env\` file to add/remove IDs.`);
  }
};
