// commands/pause.js
module.exports = {
  name: 'pause',
  description: 'Pause the current song',
  async execute(message, args, client) {
    const serverQueue = client.musicQueues.get(message.guild.id);
    if (!serverQueue || !serverQueue.player) return message.reply('❌ Nothing is playing.');
    serverQueue.player.pause();
    message.reply('⏸️ Paused.');
  }
};
