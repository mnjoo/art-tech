/* ─────────── dependencies ─────────── */
const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const http     = require('http');
const socketIO = require('socket.io');

/* ─────────── setup ─────────── */
const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

const mediaBase = path.join(__dirname, 'public', 'media');

app.use(express.static('public'));
app.use('/media', express.static(mediaBase));

/* ─────────── sockets ─────────── */
io.on('connection', (socket) => {
  console.log('[socket] client connected');

  /* channel tile clicked --------------------------------------------------- */
  socket.on('link-clicked', (channelName) => {
    console.log('[socket] channel:', channelName);

    /* hard-wired playlist for channel2 */
    if (channelName === 'channel2') {
      io.emit('show-playlist', 'PLsBtGCfy7xDYZfARrzPIyF_-YSCymi3RX');
      return;
    }

    /* otherwise send N random images for slideshow */
    const folder = path.join(mediaBase, channelName);
    fs.readdir(folder, (err, files) => {
      if (err) { console.error(err); return; }

      const imgs = files.filter(f => /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(f));
      if (!imgs.length) { console.warn('No media in', channelName); return; }

      const N = 6;                                         // how many to send
      const sample = imgs
        .sort(() => 0.5 - Math.random())                   // shuffle
        .slice(0, N)                                       // take N
        .map(f => `/media/${channelName}/${f}`);           // build URLs

      io.emit('media-files', sample);                      // broadcast array
    });
  });

  /* search bar query ------------------------------------------------------- */
  socket.on('search-query', ({ query, platform }) => {
    io.emit('show-search', { query, platform });           // broadcast to viewers
  });
});

/* ─────────── start server ─────────── */
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`▶️  http://localhost:${PORT}`);
});
