// commands/timeout.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'timeout',
  description: 'Timeout a member (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply('❌ Please mention a user or provide their ID.');
    if (isWhitelisted(target.id)) return message.reply('❌ That user is whitelisted.');
    const minutes = parseInt(args[1]) || 10;
    const reason = args.slice(2).join(' ') || 'No reason provided';
    try {
      await target.timeout(minutes * 60 * 1000, reason);
      message.reply(`✅ **${target.user.tag}** timed out for **${minutes} minutes**. Reason: ${reason}`);
    } catch (err) {
      message.reply(`❌ Failed to timeout. Reason: ${err.message}`);
    }
  }
};
