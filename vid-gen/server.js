// const express = require('express');
// const app = express();
// const http = require('http').createServer(app);
// const io = require('socket.io')(http);

// app.use(express.static('public'));

// io.on('connection', (socket) => {
//   console.log('a user connected');
  
//   socket.on('link-clicked', (url) => {
//     console.log('Controller clicked:', url);
//     socket.broadcast.emit('navigate', url); // Send to all other clients
//   });
// });


// http.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on port 3000');
// });

const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const mediaBase = path.join('public', 'media');

app.use(express.static('public'));
app.use('/media', express.static(mediaBase));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('link-clicked', (channelName) => {
    console.log('Controller clicked:', channelName);
    if (channelName === 'channel2') {
      io.emit('show-playlist', 'PLsBtGCfy7xDYZfARrzPIyF_-YSCymi3RX');
      console.log('Controller clicked: channel2, showing playlist');
    }
    else {
      const folderPath = path.join(mediaBase, channelName);

      fs.readdir(folderPath, (err, files) => {
        if (err) {
          console.error('Error reading media folder:', err);
          return;
        }

        // Build full URLs
        const mediaUrls = files.map(file => `/media/${channelName}/${file}`);
        io.emit('media-files', mediaUrls); // broadcast to all viewers
      });
    }
  });
  
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
