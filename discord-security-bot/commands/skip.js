// commands/skip.js
module.exports = {
  name: 'skip',
  description: 'Skip the current song',
  async execute(message, args, client) {
    const serverQueue = client.musicQueues.get(message.guild.id);
    if (!serverQueue || !serverQueue.queue.length) {
      return message.reply('❌ Nothing is playing right now.');
    }
    if (!message.member.voice.channel) {
      return message.reply('❌ You must be in a voice channel to skip.');
    }

    serverQueue.player.stop(); // triggers AudioPlayerStatus.Idle -> plays next
    message.reply('⏭️ Skipped!');
  }
};
