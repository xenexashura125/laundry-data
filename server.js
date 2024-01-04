const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const app = express();

// get config vars
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import route files
const userRoutes = require('./routes/users');
// const packageRoutes = require('./routes/package');
// const bookingRoutes = require('./routes/booking');
// Use route middleware
app.use('/users', userRoutes);
// app.use('/packages', packageRoutes);
// app.use('/bookings', bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});

const PORT = process.env.PORT || 5000; // Use environment variable or 5000 as the default port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});