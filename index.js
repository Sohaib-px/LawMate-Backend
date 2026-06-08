require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database'); // <-- Sequelize ki jagah MongoDB ka connect import kiya

const app = express();
app.use(cors());
app.use(express.json());

// Models (In ko abhi hum MongoDB k mutabiq badlein gy aglay step mein)
require('./models/User');
require('./models/LawCategory');
require('./models/Law');
require('./models/Post');
require('./models/Appointment');
require('./models/Notification');
require('./models/Document');
require('./models/ChatMessage');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/laws', require('./routes/law'));
app.use('/api/lawyers', require('./routes/lawyers'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/notifications', require('./routes/notifications'));

// Serve uploaded documents
app.use('/documents', express.static(path.join(__dirname, 'uploads', 'documents')));

const PORT = process.env.PORT || 4000;

// ─── MONGODB CONNECT & SERVER START ───
// Pehle database connect hoga, phir server listen karega
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});