// commands/play.js
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
const prism = require('prism-media');

const agent = ytdl.createAgent();

module.exports = {
  name: 'play',
  description: 'Play a song in your voice channel.',
  async execute(message, args, client) {
    if (!args.length) return message.reply('❌ Usage: `!play <song name or URL>`');

    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) return message.reply('❌ Join a voice channel first!');

    const searchMsg = await message.reply('🔍 Searching...');

    let url, songTitle;
    try {
      const query = args.join(' ');
      if (ytdl.validateURL(query)) {
        const info = await ytdl.getInfo(query, { agent });
        url = query;
        songTitle = info.videoDetails.title;
      } else {
        const results = await yts(query);
        if (!results.videos.length) return searchMsg.edit('❌ No results found.');
        url = results.videos[0].url;
        songTitle = results.videos[0].title;
      }
    } catch (err) {
      console.error('Search error:', err.message);
      return searchMsg.edit('❌ Could not find that song. Try: `!play song name`');
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
      playNext(guildId, client, message.channel);
    } catch (err) {
      console.error('Voice error:', err);
      client.musicQueues.delete(guildId);
      message.channel.send('❌ Failed to join voice channel.');
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
    const ytdlStream = ytdl(song.url, {
      agent,
      filter: 'audioonly',
      quality: 'lowestaudio',
      highWaterMark: 1 << 25,
      dlChunkSize: 0,
    });

    const transcoder = new prism.FFmpeg({
      args: ['-analyzeduration', '0', '-loglevel', '0', '-f', 's16le', '-ar', '48000', '-ac', '2'],
    });

    const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
    const stream = ytdlStream.pipe(transcoder).pipe(opus);

    const resource = createAudioResource(stream, { inputType: StreamType.Opus });
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
      stream.destroy();
      setTimeout(() => playNext(guildId, client, channel), 500);
    });

    player.once('error', (err) => {
      console.error('Player error:', err);
      serverQueue.playing = false;
      serverQueue.queue.shift();
      stream.destroy();
      setTimeout(() => playNext(guildId, client, channel), 500);
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err);
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
