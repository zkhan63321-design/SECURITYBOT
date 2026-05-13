// commands/play.js
// Music command using ytdl-core + @discordjs/voice

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
} = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const yts = require('yt-search');

module.exports = {
  name: 'play',
  description: 'Play a song in your voice channel. Usage: !play <song name or YouTube URL>',
  async execute(message, args, client) {
    if (!args.length) return message.reply('❌ Please provide a song name or YouTube URL.\nExample: `!play Believer Imagine Dragons`');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ You must be in a voice channel to play music!');

    const permissions = voiceChannel.permissionsFor(message.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return message.reply('❌ I need permission to join and speak in your voice channel!');
    }

    await message.reply('🔍 Searching for your song...');

    let url = args[0];
    let songInfo;

    try {
      // If not a YouTube URL, search for it
      if (!ytdl.validateURL(url)) {
        const searchQuery = args.join(' ');
        const results = await yts(searchQuery);
        if (!results.videos.length) return message.channel.send('❌ No results found for that search.');
        url = results.videos[0].url;
        songInfo = results.videos[0];
      } else {
        const info = await ytdl.getInfo(url);
        songInfo = {
          title: info.videoDetails.title,
          url: url,
          duration: { seconds: parseInt(info.videoDetails.lengthSeconds) }
        };
      }
    } catch (err) {
      console.error('Music search error:', err);
      return message.channel.send('❌ Could not find or load that song. Try a different search.');
    }

    const guildId = message.guild.id;

    // Initialize queue if needed
    if (!client.musicQueues.has(guildId)) {
      client.musicQueues.set(guildId, { queue: [], player: null, connection: null });
    }

    const serverQueue = client.musicQueues.get(guildId);
    const song = { title: songInfo.title, url, requestedBy: message.author.tag };

    // Add to queue
    serverQueue.queue.push(song);
    if (serverQueue.queue.length > 1) {
      return message.channel.send(`✅ **${song.title}** added to queue! Position: #${serverQueue.queue.length}`);
    }

    // Connect to voice channel
    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      serverQueue.connection = connection;

      connection.on(VoiceConnectionStatus.Disconnected, async () => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5000),
          ]);
        } catch {
          connection.destroy();
          client.musicQueues.delete(guildId);
        }
      });

      await playNext(guildId, client, message.channel);
    } catch (err) {
      console.error('Voice connection error:', err);
      client.musicQueues.delete(guildId);
      message.channel.send('❌ Failed to join the voice channel.');
    }
  }
};

async function playNext(guildId, client, channel) {
  const serverQueue = client.musicQueues.get(guildId);
  if (!serverQueue || !serverQueue.queue.length) {
    if (serverQueue?.connection) {
      serverQueue.connection.destroy();
    }
    client.musicQueues.delete(guildId);
    if (channel) channel.send('✅ Queue finished! Left the voice channel.').catch(() => {});
    return;
  }

  const song = serverQueue.queue[0];

  try {
    const stream = ytdl(song.url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
    });

    const resource = createAudioResource(stream);
    const player = createAudioPlayer();
    serverQueue.player = player;

    player.play(resource);
    serverQueue.connection.subscribe(player);

    if (channel) {
      channel.send(`🎵 Now playing: **${song.title}**\nRequested by: ${song.requestedBy}`).catch(() => {});
    }

    player.on(AudioPlayerStatus.Idle, () => {
      serverQueue.queue.shift();
      playNext(guildId, client, channel);
    });

    player.on('error', (err) => {
      console.error('Audio player error:', err);
      serverQueue.queue.shift();
      playNext(guildId, client, channel);
    });
  } catch (err) {
    console.error('Play error:', err);
    serverQueue.queue.shift();
    playNext(guildId, client, channel);
  }
}

module.exports.playNext = playNext;
