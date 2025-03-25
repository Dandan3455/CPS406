// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML page explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'userPage.html'));
  });

// Load initial event data from JSON
let events = [];
const eventsFilePath = path.join(__dirname, 'Data.json');

fs.readFile(eventsFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading events file:', err);
  } else {
    events = JSON.parse(data);
  }
});

// Endpoint to get initial events
app.get('/events.json', (req, res) => {
  res.json(events);
});

// Socket.IO real-time event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Emit initial events data to the newly connected client
  socket.emit('initialEvents', events);

  // Handle new report submission
  socket.on('newReport', (report) => {
    events.push({ ...report, status: 'pending' });
    io.emit('reportAdded', report);
    console.log('New report added:', report);
  });

  // Handle status toggle
  socket.on('toggleStatus', ({ index, status }) => {
    if (events[index]) {
      events[index].status = status;
      io.emit('statusToggled', { index, status });
      console.log(`Status of event ${index} updated to ${status}`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});