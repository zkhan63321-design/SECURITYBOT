module.exports = {
  name: 'resume',
  description: 'Resume the paused song',
  async execute(message, args, client) {
    const serverQueue = client.musicQueues.get(message.guild.id);
    if (!serverQueue || !serverQueue.player) return message.reply('❌ Nothing is paused.');
    serverQueue.player.unpause();
    message.reply('▶️ Resumed!');
  }
};
