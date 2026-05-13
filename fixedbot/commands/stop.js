module.exports = {
  name: 'stop',
  description: 'Stop music and leave voice channel',
  async execute(message, args, client) {
    const serverQueue = client.musicQueues.get(message.guild.id);
    if (!serverQueue) return message.reply('❌ Nothing is playing right now.');
    if (!message.member.voice.channel) return message.reply('❌ You must be in a voice channel.');
    serverQueue.queue = [];
    serverQueue.playing = false;
    if (serverQueue.player) serverQueue.player.stop();
    if (serverQueue.connection) serverQueue.connection.destroy();
    client.musicQueues.delete(message.guild.id);
    message.reply('⏹️ Stopped music and left the voice channel.');
  }
};
