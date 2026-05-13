// commands/play.js
// Uses @distube/ytdl-core — actively maintained YouTube fork

const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  entersState,
  StreamType,
} = require('@discordjs/voice');
const ytdl = require('@distube/ytdl-core');
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

    const searchMsg = await message.reply('🔍 Searching for your song...');

    let url;
    let songTitle;

    try {
      const query = args.join(' ');

      if (ytdl.validateURL(query)) {
        url = query;
        const info = await ytdl.getInfo(url);
        songTitle = info.videoDetails.title;
      } else {
        const results = await yts(query);
        if (!results.videos.length) return searchMsg.edit('❌ No results found.');
        url = results.videos[0].url;
        songTitle = results.videos[0].title;
      }
    } catch (err) {
      console.error('Search error:', err);
      return searchMsg.edit('❌ Could not find that song. Try again.');
    }

    const guildId = message.guild.id;

    if (!client.musicQueues.has(guildId)) {
      client.musicQueues.set(guildId, { queue: [], player: null, connection: null, playing: false });
    }

    const serverQueue = client.musicQueues.get(guildId);
    const song = { title: songTitle, url, requestedBy: message.author.tag };

    serverQueue.queue.push(song);

    if (serverQueue.playing) {
      return searchMsg.edit(`✅ **${song.title}** added to queue! Position: #${serverQueue.queue.length}`);
    }

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
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
        } catch {
          connection.destroy();
          client.musicQueues.delete(guildId);
        }
      });

      await searchMsg.edit(`✅ Found: **${song.title}** — loading...`);
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
    if (serverQueue?.connection) serverQueue.connection.destroy();
    client.musicQueues.delete(guildId);
    if (channel) channel.send('✅ Queue finished! Left the voice channel.').catch(() => {});
    return;
  }

  const song = serverQueue.queue[0];
  serverQueue.playing = true;

  try {
    const stream = ytdl(song.url, {
      filter: 'audioonly',
      quality: 'highestaudio',
      highWaterMark: 1 << 25,
      dlChunkSize: 0,
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
    });

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary,
    });

    const player = createAudioPlayer();
    serverQueue.player = player;

    player.play(resource);
    serverQueue.connection.subscribe(player);

    if (channel) {
      channel.send(`🎵 Now playing: **${song.title}**\nRequested by: ${song.requestedBy}`).catch(() => {});
    }

    player.once(AudioPlayerStatus.Idle, () => {
      serverQueue.playing = false;
      serverQueue.queue.shift();
      setTimeout(() => playNext(guildId, client, channel), 500);
    });

    player.once('error', (err) => {
      console.error('Player error:', err);
      serverQueue.playing = false;
      serverQueue.queue.shift();
      setTimeout(() => playNext(guildId, client, channel), 500);
    });

  } catch (err) {
    console.error('Play error:', err);
    serverQueue.playing = false;
    serverQueue.queue.shift();
    setTimeout(() => playNext(guildId, client, channel), 500);
  }
}

module.exports.playNext = playNext;
