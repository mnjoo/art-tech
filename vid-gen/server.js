const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const http     = require('http');
const socketIO = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

const mediaBase = path.join(__dirname, 'public', 'media');

app.use(express.static('public'));
app.use('/media', express.static(mediaBase));

io.on('connection', (socket) => {
  console.log('[socket] client connected');

  /* ── channel tiles ───────────────────────────────────────────────────── */
  socket.on('link-clicked', (channelName) => {
    console.log('[socket] channel:', channelName);

    /* special playlist for channel2 */
    if (channelName === 'channel2') {
      io.emit('show-playlist', 'PLsBtGCfy7xDYZfARrzPIyF_-YSCymi3RX');
      return;
    }

    /* N random media for slideshow */
    const folder = path.join(mediaBase, channelName);
    fs.readdir(folder, (err, files) => {
      if (err) { console.error(err); return; }

      const media = files.filter(f => /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(f));
      if (!media.length) { console.warn('No media in', channelName); return; }

      const N = 6;  /* how many to send */
      const sample = media
        .sort(() => 0.5 - Math.random())
        .slice(0, N)
        .map(f => `/media/${channelName}/${f}`);

      io.emit('media-files', sample);
    });
  });

  /* ── search queries ──────────────────────────────────────────────────── */
  socket.on('search-query', ({ query, platform }) => {
    io.emit('show-search', { query, platform });
  });
});

server.listen(3000, () => {
  console.log('▶️  http://localhost:3000');
});
