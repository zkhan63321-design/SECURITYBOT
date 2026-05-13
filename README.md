# 🛡️ Discord Security Bot — Complete Setup Guide

## 📁 FILE STRUCTURE
```
discord-security-bot/
├── index.js                  ← Main bot file
├── package.json              ← Dependencies
├── .env                      ← Your tokens & IDs (KEEP SECRET)
├── commands/
│   ├── ban.js
│   ├── kick.js
│   ├── timeout.js
│   ├── unban.js
│   ├── whitelist.js
│   ├── play.js               ← Music
│   ├── skip.js
│   ├── stop.js
│   ├── queue.js
│   ├── pause.js
│   ├── resume.js
│   ├── ping.js
│   └── help.js
├── events/
│   ├── ready.js
│   ├── messageCreate.js      ← Spam/abuse/everyone detection
│   ├── guildBanAdd.js        ← Anti-nuke: mass ban detection
│   ├── channelDelete.js      ← Anti-nuke: mass channel delete
│   ├── roleDelete.js         ← Anti-nuke: mass role delete
│   └── guildMemberAdd.js
└── utils/
    └── whitelist.js
```

---

## 🔑 STEP 1 — Create Your Discord Bot

1. Go to → https://discord.com/developers/applications
2. Click **"New Application"** → give it a name (e.g. "Security Bot")
3. Click **"Bot"** on the left sidebar
4. Click **"Add Bot"** → confirm
5. Under **TOKEN** → click **"Reset Token"** → copy it → paste into `.env` as `BOT_TOKEN`
6. Scroll down and enable ALL these **Privileged Gateway Intents**:
   - ✅ PRESENCE INTENT
   - ✅ SERVER MEMBERS INTENT
   - ✅ MESSAGE CONTENT INTENT
7. Click **Save Changes**

---

## 🆔 STEP 2 — Find Your Owner ID (Your Discord User ID)

1. Open Discord
2. Go to **Settings → Advanced → Enable Developer Mode**
3. Right-click on your own name anywhere → click **"Copy User ID"**
4. Paste into `.env` as `OWNER_ID`

---

## 📨 STEP 3 — Invite the Bot to Your Server

1. In the Developer Portal → click **"OAuth2"** → **"URL Generator"**
2. Under SCOPES tick: ✅ `bot`
3. Under BOT PERMISSIONS tick:
   - ✅ Administrator  *(needed for anti-nuke to work)*
4. Copy the generated URL → open it in browser → select your server → click **Authorize**

> ⚠️ The bot MUST have Administrator permission AND its role must be the HIGHEST role in your server, otherwise it cannot ban nukers.

---

## ⚙️ STEP 4 — Configure Your .env File

Open `.env` and fill in:

```
BOT_TOKEN=paste_your_bot_token_here
OWNER_ID=paste_your_user_id_here
PREFIX=!
WHITELIST=your_id,trusted_friend_id,another_trusted_id
```

- `WHITELIST` = comma-separated user IDs who bypass ALL security rules
- Always include your own ID in WHITELIST

---

## 📦 STEP 5 — Install & Run

Make sure you have **Node.js v18+** installed: https://nodejs.org

Open a terminal in the bot folder and run:

```bash
npm install
node index.js
```

You should see:
```
✅ Bot is online as YourBot#1234
📡 Serving 1 server(s)
```

---

## 🏗️ STEP 6 — Set Up a #mod-log Channel

Create a text channel in your server named exactly:
```
mod-log
```
The bot will automatically send all security alerts there.

---

## 🚀 STEP 7 — Run 24/7 (Free Hosting)

### Option A — Railway.app (Recommended, Free)
1. Go to https://railway.app → sign up with GitHub
2. Click **New Project → Deploy from GitHub repo**
3. Upload your bot folder to a GitHub repo first
4. Add your `.env` variables in Railway's **Variables** tab
5. Deploy — your bot runs 24/7 for free!

### Option B — Replit (Easy)
1. Go to https://replit.com → create account
2. Click **New Repl → Import from GitHub** or paste files manually
3. Add a `replit.nix` or use their Secrets tab for `.env` values
4. Use **UptimeRobot** (https://uptimerobot.com) to ping your Repl URL every 5 minutes to keep it alive

### Option C — Your Own PC (PM2)
```bash
npm install -g pm2
pm2 start index.js --name "security-bot"
pm2 save
pm2 startup   # auto-start on reboot
```

---

## 🛡️ SECURITY FEATURES EXPLAINED

| Feature | Trigger | Action |
|---|---|---|
| Mass Ban Detection | 3+ bans in 10 seconds | Nuker gets banned + roles stripped |
| Mass Channel Delete | 3+ deletes in 10 seconds | Nuker gets banned + roles stripped |
| Mass Role Delete | 3+ deletes in 10 seconds | Nuker gets banned + roles stripped |
| @everyone/@here spam | Non-whitelisted user pings everyone | Message deleted + user banned |
| Spam Detection | 5+ messages in 5 seconds | 10 minute timeout |
| Abusive Language | Blacklisted words used | Message deleted + 60 minute timeout |

---

## 🎵 MUSIC COMMANDS

| Command | What it does |
|---|---|
| `!play <song or URL>` | Search YouTube and play in your voice channel |
| `!skip` | Skip to next song |
| `!stop` | Stop music and bot leaves channel |
| `!queue` | Show all songs in queue |
| `!pause` | Pause playback |
| `!resume` | Resume playback |

---

## 🔒 MODERATION COMMANDS (Whitelist Only)

| Command | Example |
|---|---|
| `!ban @user reason` | `!ban @BadUser Breaking rules` |
| `!kick @user reason` | `!kick @TrollUser Trolling` |
| `!timeout @user 30 reason` | `!timeout @SpamUser 30 Spamming` |
| `!unban 123456789` | Unban by user ID |
| `!whitelist` | View trusted users (owner only) |

---

## ❓ COMMON ISSUES

**Bot is online but not responding to commands?**
→ Make sure MESSAGE CONTENT INTENT is enabled in the Developer Portal

**Bot can't ban the nuker?**
→ The bot's role must be ABOVE the nuker's role in Server Settings → Roles

**Music not working?**
→ Run `npm install` again, make sure ffmpeg-static installed correctly

**Bot goes offline?**
→ Use Railway or PM2 for 24/7 uptime

---

## ⚠️ IMPORTANT SECURITY NOTES

- NEVER share your `BOT_TOKEN` with anyone
- NEVER commit your `.env` file to GitHub (add `.env` to `.gitignore`)
- Regularly check your `#mod-log` channel for security alerts
- Only add people you truly trust to the WHITELIST
