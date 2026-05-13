// commands/ping.js
module.exports = {
  name: 'ping',
  description: 'Check bot latency',
  async execute(message, args, client) {
    const sent = await message.reply('🏓 Pinging...');
    const latency = sent.createdTimestamp - message.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);
    sent.edit(`🏓 **Pong!**\n📶 Bot Latency: \`${latency}ms\`\n💡 API Latency: \`${apiLatency}ms\``);
  }
};
