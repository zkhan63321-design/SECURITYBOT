// commands/kick.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'kick',
  description: 'Kick a member (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }
    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) return message.reply('❌ Please mention a user or provide their ID.');
    if (isWhitelisted(target.id)) return message.reply('❌ That user is whitelisted and cannot be kicked.');
    const reason = args.slice(1).join(' ') || 'No reason provided';
    try {
      await target.kick(`Kicked by ${message.author.tag}: ${reason}`);
      message.reply(`✅ **${target.user.tag}** has been kicked. Reason: ${reason}`);
    } catch (err) {
      message.reply(`❌ Failed to kick. Reason: ${err.message}`);
    }
  }
};
