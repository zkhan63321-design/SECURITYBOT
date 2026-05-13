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
    if (!userId) return message.reply('❌ Please provide the user ID to unban.\nUsage: `!unban 123456789`');

    // Validate it looks like a Discord ID
    if (!/^\d{17,20}$/.test(userId)) {
      return message.reply('❌ That does not look like a valid Discord user ID.\nExample: `!unban 123456789012345678`');
    }

    try {
      // Fetch ban list and check if user is actually banned
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.get(userId);

      if (!bannedUser) {
        return message.reply(`❌ User **${userId}** is not in the ban list.`);
      }

      await message.guild.members.unban(userId, `Unbanned by ${message.author.tag}`);
      message.reply(`✅ **${bannedUser.user.tag}** has been unbanned successfully.`);

    } catch (err) {
      console.error('Unban error:', err);
      if (err.code === 10026) {
        return message.reply('❌ That user is not banned.');
      }
      message.reply(`❌ Failed to unban. Make sure the ID is correct.\nError: ${err.message}`);
    }
  }
};
