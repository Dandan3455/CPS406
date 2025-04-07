// server.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto'); // For generating unique IDs
const nodemailer = require('nodemailer'); // For sending emails

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'cypressgroup88@gmail.com', 
    pass: 'cusd rntz qnna gbsd',       
  },
});


function sendEmail(report, subject, message) {
  const mailOptions = {
    from: '"Cypress Report System" <your_email@example.com>', 
    to: report.email,
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Email sending error:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname)));

// Serve the main HTML page explicitly
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'userPage.html'));
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

function generateReportId(report) {
  const hash = crypto.createHash('sha256');
  hash.update(report.desc + report.email + Date.now().toString());
  return hash.digest('hex').slice(0, 6);
}

// Socket.IO real-time event handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Emit initial events data to the newly connected client
  socket.emit('initialEvents', events);

  // Handle new report submission
  socket.on('newReport', (report) => {
    report.id = generateReportId(report);
    report.status = 'pending';
    events.push(report);
    io.emit('reportAdded', report);
    console.log('New report added:', report);
    const subject = 'New Report Created';
    const message = `Your report (ID: ${report.id}) has been created and is currently pending.`;
    sendEmail(report, subject, message);
  });

  // Handle status toggle
  socket.on('toggleStatus', ({ index, status }) => {
    if (events[index]) {
      events[index].status = status;
      io.emit('statusToggled', { index, status });
      console.log(`Status of event ${index} updated to ${status}`);

      if (['solved'].includes(status.toLowerCase())) {
        const report = events[index];
        const subject = 'Report Completed';
        const message = `Your report (ID: ${report.id}) has been marked as completed. Thank you for your submission!`;
        sendEmail(report, subject, message);
      }
    }
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
