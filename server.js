/* ─────────── dependencies ─────────── */
const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const http     = require('http');
const socketIO = require('socket.io');
const { channel } = require('diagnostics_channel');

/* ─────────── setup ─────────── */
const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

const mediaBase = path.join(__dirname, 'public', 'media');

app.use(express.static('public'));
app.use('/media', express.static(mediaBase));
channel_map = {
  'channel2': 'PLsBtGCfy7xDYZfARrzPIyF_-YSCymi3RX',
  'channel3': 'PLsBtGCfy7xDbWREdJ5Hh_YwS8Qgnquq6l',
  'channel4': 'PLsBtGCfy7xDb7qLZXnduwuhP_ms3k5H2X',
  'channel5': 'PLsBtGCfy7xDYbq0Ii43kG6zDqZ7iqESHi',
  'channel6': 'PLsBtGCfy7xDbdgnT0vRnbtV2LHSeGOEaL',
  'channel7': 'PLsBtGCfy7xDbRTDVha223g6fkGLM-v21S',
};

/* ─────────── sockets ─────────── */
io.on('connection', (socket) => {
  console.log('[socket] client connected');

  /* channel tile clicked --------------------------------------------------- */
  socket.on('link-clicked', (channelName) => {
    console.log('[socket] channel:', channelName);

    /* hard-wired playlist for channel2 */
    if (channelName in channel_map) {
      io.emit('show-playlist', channel_map[channelName]);
      return;
    }

    else {
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
    }
    
  });

  /* search bar query ------------------------------------------------------- */
  socket.on('search-query', ({ query, platform }) => {
    io.emit('show-search', { query, platform });           // broadcast to viewers
  });
});

/* ─────────── start server ─────────── */
// const PORT = 3000;
// server.listen(PORT, () => {
//   console.log(`▶️  http://localhost:${PORT}`);
// });

http.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
