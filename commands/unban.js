// commands/unban.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'unban',
  description: 'Unban a user by username or ID (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    if (!args.length) return message.reply('❌ Please provide a username or user ID.\nUsage: `!unban username` or `!unban 123456789012345678`');

    const query = args.join(' ').toLowerCase().trim();

    try {
      // Fetch full ban list
      const bans = await message.guild.bans.fetch();

      if (!bans.size) return message.reply('📋 There are no banned users in this server.');

      let bannedEntry = null;

      // Check if query is a user ID
      if (/^\d{17,20}$/.test(query)) {
        bannedEntry = bans.get(query);
      }

      // If not found by ID, search by username
      if (!bannedEntry) {
        bannedEntry = bans.find(ban =>
          ban.user.username.toLowerCase() === query ||
          ban.user.tag.toLowerCase() === query ||
          ban.user.displayName?.toLowerCase() === query ||
          ban.user.username.toLowerCase().includes(query)
        );
      }

      if (!bannedEntry) {
        return message.reply(`❌ Could not find a banned user matching **"${args.join(' ')}"**.\nTry using their exact username or user ID.`);
      }

      await message.guild.members.unban(bannedEntry.user.id, `Unbanned by ${message.author.tag}`);
      message.reply(`✅ **${bannedEntry.user.tag}** has been unbanned successfully.`);

    } catch (err) {
      console.error('Unban error:', err);
      message.reply(`❌ Failed to unban.\nReason: ${err.message}`);
    }
  }
};
