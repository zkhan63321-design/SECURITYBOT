// events/messageCreate.js
const { isWhitelisted } = require('../utils/whitelist');

// Spam tracking: userId -> { count, firstMessage timestamp }
const spamMap = new Map();
const SPAM_LIMIT = 5;       // messages
const SPAM_WINDOW = 5000;   // 5 seconds
const SPAM_TIMEOUT = 10 * 60 * 1000; // 10 minutes in ms

// Abusive words list — add/remove as needed
const ABUSIVE_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'bastard', 'dick', 'cunt', 'nigger',
  'faggot', 'retard', 'whore', 'slut', 'asshole', 'motherfucker'
];
const ABUSE_TIMEOUT = 60 * 60 * 1000; // 60 minutes in ms

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (!message.guild || message.author.bot) return;

    const member = message.member;
    const userId = message.author.id;
    const content = message.content.toLowerCase();
    const whitelisted = isWhitelisted(userId);

    // ── 1. COMMAND HANDLING ──────────────────────────────────────────────
    const prefix = process.env.PREFIX || '!';
    if (content.startsWith(prefix)) {
      const args = message.content.slice(prefix.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();
      const command = client.commands.get(commandName);
      if (command) {
        try {
          await command.execute(message, args, client);
        } catch (err) {
          console.error(`Command error (${commandName}):`, err);
          message.reply('❌ An error occurred running that command.').catch(() => {});
        }
      }
      return;
    }

    // ── 2. @EVERYONE / @HERE DETECTION ──────────────────────────────────
    if (!whitelisted && (message.mentions.everyone)) {
      try {
        await message.delete();
        await member.ban({ reason: '🔒 Anti-Nuke: Unauthorized @everyone/@here mention' });
        logAction(message.guild, `🚫 **BANNED** <@${userId}> for tagging @everyone/@here`);
      } catch (err) {
        console.error('Failed to ban @everyone abuser:', err);
      }
      return;
    }

    // ── 3. SPAM DETECTION ────────────────────────────────────────────────
    if (!whitelisted) {
      const now = Date.now();
      const userData = spamMap.get(userId) || { count: 0, first: now };

      if (now - userData.first > SPAM_WINDOW) {
        // Reset window
        spamMap.set(userId, { count: 1, first: now });
      } else {
        userData.count++;
        spamMap.set(userId, userData);

        if (userData.count >= SPAM_LIMIT) {
          spamMap.delete(userId);
          try {
            await member.timeout(SPAM_TIMEOUT, '🔒 Anti-Spam: Too many messages too fast');
            await message.channel.send(
              `⏱️ <@${userId}> has been **timed out for 10 minutes** for spamming.`
            );
            logAction(message.guild, `⏱️ **TIMEOUT 10min** <@${userId}> — spam detected`);
          } catch (err) {
            console.error('Failed to timeout spammer:', err);
          }
          return;
        }
      }
    }

    // ── 4. ABUSIVE LANGUAGE DETECTION ───────────────────────────────────
    if (!whitelisted) {
      const hasAbuse = ABUSIVE_WORDS.some(word => content.includes(word));
      if (hasAbuse) {
        try {
          await message.delete();
          await member.timeout(ABUSE_TIMEOUT, '🔒 Language filter: Abusive language used');
          await message.channel.send(
            `🤐 <@${userId}> has been **timed out for 60 minutes** for abusive language.`
          );
          logAction(message.guild, `🤐 **TIMEOUT 60min** <@${userId}> — abusive language`);
        } catch (err) {
          console.error('Failed to timeout abuser:', err);
        }
        return;
      }
    }
  }
};

// ── HELPER: send log to first text channel named "mod-log" or "security-log" ──
async function logAction(guild, message) {
  const logChannel = guild.channels.cache.find(
    c => c.isTextBased() && ['mod-log', 'security-log', 'bot-log', 'logs'].includes(c.name)
  );
  if (logChannel) {
    logChannel.send(`[🛡️ Security Log] ${message}`).catch(() => {});
  }
}
