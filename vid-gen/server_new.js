const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const mediaBase = path.join(__dirname, 'media');

app.use(express.static(__dirname));
app.use('/media', express.static(mediaBase));

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('link-clicked', (channelName) => {
    console.log('Controller clicked:', channelName);
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
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
