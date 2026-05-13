// events/guildMemberAdd.js
module.exports = {
  name: 'guildMemberAdd',
  async execute(member, client) {
    // Log new member joins (for audit purposes)
    console.log(`[JOIN] ${member.user.tag} joined ${member.guild.name}`);
  }
};
