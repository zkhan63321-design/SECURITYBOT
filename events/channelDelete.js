// events/channelDelete.js
// Detects mass channel deletions (nuke attempts)

const { isWhitelisted } = require('../utils/whitelist');

const deleteTracker = new Map();
const DELETE_THRESHOLD = 3;
const DELETE_WINDOW = 10000; // 10 seconds

module.exports = {
  name: 'channelDelete',
  async execute(channel, client) {
    const guild = channel.guild;
    if (!guild) return;

    await new Promise(r => setTimeout(r, 500));
    const auditLogs = await guild.fetchAuditLogs({ type: 12, limit: 1 }).catch(() => null);
    if (!auditLogs) return;

    const entry = auditLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    if (!executor || executor.id === client.user.id) return;
    if (isWhitelisted(executor.id)) return;

    const now = Date.now();
    const data = deleteTracker.get(executor.id) || { count: 0, first: now };

    if (now - data.first > DELETE_WINDOW) {
      deleteTracker.set(executor.id, { count: 1, first: now });
    } else {
      data.count++;
      deleteTracker.set(executor.id, data);

      if (data.count >= DELETE_THRESHOLD) {
        deleteTracker.delete(executor.id);
        console.warn(`⚠️ MASS CHANNEL DELETE by ${executor.tag}`);

        const member = guild.members.cache.get(executor.id)
          || await guild.members.fetch(executor.id).catch(() => null);

        if (member) {
          await member.roles.set([], 'Anti-Nuke: mass channel delete').catch(() => {});
          await guild.members.ban(executor.id, {
            reason: '🔒 Anti-Nuke: Mass channel deletion detected'
          }).catch(() => {});
        }

        logAction(guild, `🚨 **CHANNEL NUKE STOPPED!** <@${executor.id}> was mass-deleting channels. **Banned + roles stripped.**`);
      }
    }
  }
};

async function logAction(guild, msg) {
  const ch = guild.channels.cache.find(
    c => c.isTextBased() && ['mod-log','security-log','bot-log','logs'].includes(c.name)
  );
  if (ch) ch.send(`[🛡️ Security Log] ${msg}`).catch(() => {});
}
