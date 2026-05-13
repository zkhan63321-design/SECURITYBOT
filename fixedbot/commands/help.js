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
\`!unban username\` — Unban by username (shows ban list if not found)

**👑 Whitelist (Owner Only)**
\`!whitelist\` — View whitelisted users
\`!whitelist add @user\` — Add user to whitelist
\`!whitelist remove @user\` — Remove user from whitelist

**🚨 Auto-Security (Always Active)**
• Mass ban detection → nuker gets banned instantly
• Mass channel delete detection → nuker gets banned
• Mass role delete detection → nuker gets banned
• @everyone / @here spam → user gets banned
• Message spam (5 msgs/5s) → 10 min timeout
• Abusive language → 60 min timeout

**🎵 Music (Anyone Can Use)**
\`!play <song name>\` — Play a song (join VC first!)
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
