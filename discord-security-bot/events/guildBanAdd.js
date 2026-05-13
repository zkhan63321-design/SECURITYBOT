// events/guildBanAdd.js
// Detects mass bans (nuke attempts) and reverses them

const { isWhitelisted } = require('../utils/whitelist');

const banTracker = new Map(); // userId -> { count, timer }
const BAN_THRESHOLD = 3;     // bans within window = nuke attempt
const BAN_WINDOW = 10000;    // 10 seconds

module.exports = {
  name: 'guildBanAdd',
  async execute(ban, client) {
    const guild = ban.guild;

    // Fetch audit log to find WHO did the ban
    await new Promise(r => setTimeout(r, 500)); // small delay for audit log
    const auditLogs = await guild.fetchAuditLogs({ type: 22, limit: 1 }).catch(() => null);
    if (!auditLogs) return;

    const entry = auditLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    if (!executor) return;
    if (executor.id === client.user.id) return; // ignore bot's own bans
    if (isWhitelisted(executor.id)) return;     // ignore whitelisted users

    // Track ban count for this executor
    const now = Date.now();
    const data = banTracker.get(executor.id) || { count: 0, first: now };

    if (now - data.first > BAN_WINDOW) {
      banTracker.set(executor.id, { count: 1, first: now });
    } else {
      data.count++;
      banTracker.set(executor.id, data);

      if (data.count >= BAN_THRESHOLD) {
        banTracker.delete(executor.id);
        console.warn(`⚠️ NUKE ATTEMPT detected by ${executor.tag} in ${guild.name}`);

        // Remove their roles / ban them
        const member = guild.members.cache.get(executor.id)
          || await guild.members.fetch(executor.id).catch(() => null);

        if (member) {
          // Strip all roles first
          await member.roles.set([], 'Anti-Nuke: mass ban detected').catch(() => {});
          // Then ban the nuker
          await guild.members.ban(executor.id, {
            reason: '🔒 Anti-Nuke: Mass ban attempt detected and stopped'
          }).catch(() => {});
        }

        logAction(guild, `🚨 **NUKE ATTEMPT STOPPED!** <@${executor.id}> (${executor.tag}) was performing a mass ban. They have been **banned** and roles stripped.`);
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
