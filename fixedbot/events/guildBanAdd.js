const { isWhitelisted } = require('../utils/whitelist');

const banTracker = new Map();
const BAN_THRESHOLD = 3;
const BAN_WINDOW = 10000;

module.exports = {
  name: 'guildBanAdd',
  async execute(ban, client) {
    const guild = ban.guild;
    await new Promise(r => setTimeout(r, 500));
    const auditLogs = await guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
    if (!auditLogs) return;
    const entry = auditLogs.entries.first();
    if (!entry) return;
    const executor = entry.executor;
    if (!executor || executor.id === client.user.id) return;
    if (isWhitelisted(executor.id)) return;

    const now = Date.now();
    const data = banTracker.get(executor.id) || { count: 0, first: now };
    if (now - data.first > BAN_WINDOW) {
      banTracker.set(executor.id, { count: 1, first: now });
    } else {
      data.count++;
      banTracker.set(executor.id, data);
      if (data.count >= BAN_THRESHOLD) {
        banTracker.delete(executor.id);
        const member = guild.members.cache.get(executor.id) || await guild.members.fetch(executor.id).catch(() => null);
        if (member) {
          await member.roles.set([], 'Anti-Nuke: mass ban detected').catch(() => {});
          await guild.members.ban(executor.id, { reason: '🔒 Anti-Nuke: Mass ban attempt' }).catch(() => {});
        }
        logAction(guild, `🚨 **NUKE STOPPED!** <@${executor.id}> (${executor.tag}) mass banned. **Banned + roles stripped.**`);
      }
    }
  }
};

async function logAction(guild, msg) {
  const ch = guild.channels.cache.find(c => c.isTextBased() && ['mod-log','security-log','bot-log','logs'].includes(c.name));
  if (ch) ch.send(`[🛡️ Security Log] ${msg}`).catch(() => {});
}
