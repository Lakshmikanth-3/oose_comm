const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// CORS Configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Static files
app.use(express.static('public'));

// Routes
const userRoutes = require('./routes/users');
const toolRoutes = require('./routes/tools');
const usageRoutes = require('./routes/usage');

app.use('/api/users', userRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/usage', usageRoutes);

// Home route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../public/index.html');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
