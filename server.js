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

// Define the path for Data.json.
const eventsFilePath = path.join(__dirname, 'Data.json');

// Ensure Data.json exists and is valid JSON.
if (!fs.existsSync(eventsFilePath)) {
  // Create Data.json with an empty array if it does not exist.
  fs.writeFileSync(eventsFilePath, '[]', 'utf8');
}

// Load initial event data synchronously.
let events = [];
try {
  const fileData = fs.readFileSync(eventsFilePath, 'utf8');
  events = JSON.parse(fileData);
  console.log('Loaded events from Data.json:', events);
} catch (e) {
  console.error('Error loading events from Data.json:', e);
  events = [];
}

// Configure the nodemailer transporter.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: 'cypressgroup88@gmail.com', 
    pass: 'cusd rntz qnna gbsd',       
  },
});

// Helper function to save events to Data.json.
function saveEvents() {
  fs.writeFile(eventsFilePath, JSON.stringify(events, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Error saving events:', err);
    } else {
      console.log('Events saved successfully.');
    }
  });
}

// Helper function to send email to the report creator.
function sendEmail(report, subject, message) {
  const mailOptions = {
    from: '"Cypress Report System" <your_email@example.com>',
    to: report.email,  // recipient from report
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

// Optional: helper function to send an email to the government department.
function sendGovEmail(report, subject, message) {
  const mailOptions = {
    from: '"Cypress Report System" <your_email@example.com>',
    to: report.govDeptEmail, // government department email
    subject: subject,
    text: message,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Gov Email sending error:', error);
    } else {
      console.log('Gov Email sent:', info.response);
    }
  });
}

// Serve static files from the current directory.
app.use(express.static(path.join(__dirname)));

// Serve the main user page.
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'userPage.html'));
});

// Serve the admin backend page.
app.get('/backend', (req, res) => {
  res.sendFile(path.join(__dirname, 'mimicked_backend.html'));
});

// Endpoint to get current events as JSON.
app.get('/events.json', (req, res) => {
  res.json(events);
});

// Generate a unique report ID.
function generateReportId(report) {
  const hash = crypto.createHash('sha256');
  hash.update(report.desc + report.email + Date.now().toString());
  return hash.digest('hex').slice(0, 6);
}

// Socket.IO real-time event handling.
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Emit the current events to the connected client.
  socket.emit('initialEvents', events);

  // Handle new report submissions.
  socket.on('newReport', (report) => {
    // Make sure report contains required properties, including latlng.
    if (!report.latlng) {
      console.error('Report is missing latlng:', report);
      return;
    }
    //report.id = generateReportId(report);
    report.status = 'pending';
    report.time = new Date().toISOString();
    // Add placeholder government department information.
    report.govDept = 'Public Works Department';
    report.govDeptEmail = 'publicworks@example.com';

    events.push(report);
    saveEvents();
    io.emit('reportAdded', report);
    console.log('New report added:', report);

    const subject = 'New Report Created';
    const message = `Your report (ID: ${report.referencenumber}) has been created at ${report.time} and is currently pending.`;
    sendEmail(report, subject, message);
  });

  // Handle status updates (including solved, deleted, in progress).
  socket.on('toggleStatus', ({ index, status }) => {
    if (events[index]) {
      events[index].status = status;
      io.emit('statusToggled', { index, status });
      console.log(`Status of event ${index} updated to ${status}`);

      const report = events[index];

      if (status.toLowerCase() === 'solved') {
        const subject = 'Report Completed';
        const message = `Your report (ID: ${report.referencenumber}) has been marked as solved. Thank you for your submission!`;
        sendEmail(report, subject, message);
      } else if (status.toLowerCase() === 'deleted') {
        const subject = 'Report Deleted';
        const message = `Your report (ID: ${report.referencenumber}) has been deleted.`;
        sendEmail(report, subject, message);
      } else if (status.toLowerCase() === 'in progress') {
        const subject = 'Report In Progress';
        const message = `Your report (ID: ${report.referencenumber}) is now in progress. The ${report.govDept} has started working on it.`;
        sendEmail(report, subject, message);
        sendGovEmail(report, 'New Report In Progress', `Report (ID: ${report.referencenumber}) has been set to in progress.`);
      }

      saveEvents();
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start the server.
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
