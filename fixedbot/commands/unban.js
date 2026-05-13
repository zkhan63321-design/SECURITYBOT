// commands/unban.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'unban',
  description: 'Unban a user by username or ID (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    if (!args.length) return message.reply('❌ Usage: `!unban username` or `!unban userID`');

    try {
      const bans = await message.guild.bans.fetch();
      if (!bans.size) return message.reply('📋 No banned users in this server.');

      const query = args.join(' ').replace(/@/g, '').trim().toLowerCase();

      let bannedEntry = null;

      // Search by ID first
      if (/^\d{17,20}$/.test(query)) {
        bannedEntry = bans.get(query);
      }

      // Search by username
      if (!bannedEntry) {
        bannedEntry = bans.find(ban =>
          ban.user.username.toLowerCase() === query ||
          ban.user.tag.toLowerCase() === query ||
          ban.user.username.toLowerCase().includes(query)
        );
      }

      if (!bannedEntry) {
        const banList = bans.map(b => `• ${b.user.username}`).slice(0, 10).join('\n');
        return message.reply(
          `❌ No banned user found matching **"${query}"**\n\n` +
          `**Banned users in this server:**\n${banList}\n\n` +
          `Use: \`!unban exactusername\``
        );
      }

      await message.guild.members.unban(bannedEntry.user.id, `Unbanned by ${message.author.tag}`);
      message.reply(`✅ **${bannedEntry.user.username}** has been unbanned successfully.`);

    } catch (err) {
      console.error('Unban error:', err);
      message.reply(`❌ Failed to unban. Reason: ${err.message}`);
    }
  }
};
