// commands/unban.js
const { isWhitelisted } = require('../utils/whitelist');

module.exports = {
  name: 'unban',
  description: 'Unban a user (whitelisted users only)',
  async execute(message, args, client) {
    if (!isWhitelisted(message.author.id)) {
      return message.reply('❌ You are not authorized to use this command.');
    }

    if (!args.length) return message.reply('❌ Usage: `!unban username`');

    try {
      const bans = await message.guild.bans.fetch();
      if (!bans.size) return message.reply('📋 No banned users in this server.');

      // Clean up the query — remove @, spaces, lowercase
      const query = args.join(' ').replace(/@/g, '').trim().toLowerCase();

      // Search ban list
      const bannedEntry = bans.find(ban =>
        ban.user.username.toLowerCase() === query ||
        ban.user.username.toLowerCase().includes(query) ||
        ban.user.tag.toLowerCase() === query ||
        ban.user.id === query
      );

      if (!bannedEntry) {
        // Show list of banned users to help
        const banList = bans.map(b => `• ${b.user.username}`).slice(0, 10).join('\n');
        return message.reply(
          `❌ No banned user found matching **"${query}"**\n\n` +
          `**Banned users:**\n${banList}\n\n` +
          `Use their exact username. Example: \`!unban zeeshan\``
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
