const express  = require('express');
const fs       = require('fs');
const path     = require('path');
const http     = require('http');
const socketIO = require('socket.io');

const app    = express();
const server = http.createServer(app);
const io     = socketIO(server);

// in-memory store of comments
let comments = [];

const mediaBase = path.join(__dirname, 'public', 'media');

app.use(express.static('public'));
app.use('/media', express.static(mediaBase));

io.on('connection', socket => {
  console.log('[socket] client connected');

  // channel tile clicked
  socket.on('link-clicked', channelName => {
    console.log('[socket] channel:', channelName);

    // special playlist for channel2
    if (channelName === 'channel2') {
      io.emit('show-playlist', 'PLsBtGCfy7xDYZfARrzPIyF_-YSCymi3RX');
      return;
    }

    // otherwise send N random media items
    const folder = path.join(mediaBase, channelName);
    fs.readdir(folder, (err, files) => {
      if (err) return console.error(err);
      const media = files.filter(f =>
        /\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i.test(f)
      );
      if (!media.length) return console.warn('No media in', channelName);

      const N = 6;
      const sample = media
        .sort(() => 0.5 - Math.random())
        .slice(0, N)
        .map(f => `/media/${channelName}/${f}`);

      io.emit('media-files', sample);
    });
  });

  // search bar query
  socket.on('search-query', ({ query, platform }) => {
    io.emit('show-search', { query, platform });
  });

  // new comment from controller
  socket.on('new-comment', txt => {
    console.log('[socket] new-comment:', txt);
    comments.push(txt);
  });
});

// every 15s, pick a random comment and broadcast
setInterval(() => {
  if (comments.length) {
    const rand = comments[Math.floor(Math.random() * comments.length)];
    io.emit('show-comment', rand);
  }
}, 15000);

server.listen(3000, () => {
  console.log('▶️  http://localhost:3000');
});
