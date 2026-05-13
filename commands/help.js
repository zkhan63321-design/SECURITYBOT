// commands/help.js
module.exports = {
  name: 'help',
  description: 'Show all bot commands',
  async execute(message, args, client) {
    const helpText = `
🛡️ **SECURITY BOT — COMMAND LIST**

**🔒 Moderation (Whitelist Only)**
\`!ban @user [reason]\` — Ban a member
\`!kick @user [reason]\` — Kick a member
\`!timeout @user [minutes] [reason]\` — Timeout a member
\`!unban <userID>\` — Unban a user by ID
\`!whitelist\` — View whitelisted users (owner only)

**🚨 Auto-Security (Always Active)**
• Mass ban detection → nuker gets banned instantly
• Mass channel delete detection → nuker gets banned
• Mass role delete detection → nuker gets banned
• @everyone / @here spam → user gets banned
• Message spam (5 msgs/5s) → 10 min timeout
• Abusive language → 60 min timeout

**🎵 Music (Anyone Can Use)**
\`!play <song name or YouTube URL>\` — Play a song
\`!skip\` — Skip current song
\`!stop\` — Stop music & leave voice channel
\`!queue\` — Show the music queue
\`!pause\` — Pause playback
\`!resume\` — Resume playback

**ℹ️ Info**
\`!help\` — Show this message
\`!ping\` — Check bot latency
    `.trim();

    message.reply(helpText);
  }
};
