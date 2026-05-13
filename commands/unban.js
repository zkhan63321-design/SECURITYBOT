// commands/unban.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'unban',
  description: 'Unban a user by mention or username (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    if (!args.length) return message.reply('❌ Usage: `!unban @username` or `!unban username`');

    try {
      const bans = await message.guild.bans.fetch();
      if (!bans.size) return message.reply('📋 There are no banned users in this server.');

      let bannedEntry = null;

      // Get username from mention like !unban @username
      // Mentions of banned users won't resolve normally, so extract from raw text
      const raw = message.content.slice(message.content.indexOf(' ')).trim();
      
      // Remove @ and # symbols to get clean username
      const cleanQuery = raw.replace(/^@/, '').toLowerCase().trim();

      // Search ban list by username
      bannedEntry = bans.find(ban =>
        ban.user.username.toLowerCase() === cleanQuery ||
        ban.user.tag.toLowerCase() === cleanQuery ||
        ban.user.username.toLowerCase().includes(cleanQuery)
      );

      // Also try by ID if it looks like one
      if (!bannedEntry && /^\d{17,20}$/.test(cleanQuery)) {
        bannedEntry = bans.get(cleanQuery);
      }

      if (!bannedEntry) {
        return message.reply(`❌ No banned user found matching **"${raw}"**.\nNote: Type their exact Discord username.`);
      }

      await message.guild.members.unban(bannedEntry.user.id, `Unbanned by ${message.author.tag}`);
      message.reply(`✅ **${bannedEntry.user.tag}** has been unbanned successfully.`);

    } catch (err) {
      console.error('Unban error:', err);
      message.reply(`❌ Failed to unban. Reason: ${err.message}`);
    }
  }
};
