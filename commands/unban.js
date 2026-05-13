// commands/unban.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'unban',
  description: 'Unban a user by ID (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    const userId = args[0];
    if (!userId) return message.reply('❌ Please provide the user ID to unban.');

    await message.guild.members.unban(userId, `Unbanned by ${message.author.tag}`);
    message.reply(`✅ User **${userId}** has been unbanned.`);
  }
};
