// commands/queue.js
module.exports = {
  name: 'queue',
  description: 'Show the current music queue',
  async execute(message, args, client) {
    const serverQueue = client.musicQueues.get(message.guild.id);
    if (!serverQueue || !serverQueue.queue.length) {
      return message.reply('📭 The queue is empty. Use `!play <song>` to add songs!');
    }

    const list = serverQueue.queue
      .map((song, i) => `${i === 0 ? '🎵' : `${i + 1}.`} **${song.title}** — *${song.requestedBy}*`)
      .join('\n');

    message.reply(`🎶 **Current Queue (${serverQueue.queue.length} songs):**\n${list}`);
  }
};
