const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// Load Passport strategy
require('./auth/passport');

const dossierRoutes = require('./routes/dossier');

// Routes
app.use('/auth', authRoutes);
app.use('/dossiers', dossierRoutes);

app.get('/', (req, res) => {
  res.send('RentTitan Backend API');
});

const PORT = process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
