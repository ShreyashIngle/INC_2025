// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import mongoose from 'mongoose';
// import passport from 'passport';
// import authRoutes from './routes/auth.js';
// import leetcodeRoutes from './routes/leetcode.js';
// import morgan from 'morgan';
// import './config/passport.js';

// dotenv.config();

// const app = express();
// app.options("*", cors());
// // CORS configuration
// // app.use(cors({
// //   origin: 'http://localhost:5173', // Frontend URL
// //   credentials: true,
// //   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
// //   allowedHeaders: ['Content-Type', 'Authorization']
// // }));

// // Middleware
// app.use(express.json());
// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
//   res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
//   next();
// });
// app.use(passport.initialize());
// app.use(morgan("tiny"));

// // Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/leetcode', leetcodeRoutes);

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('MongoDB connection error:', err));

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ message: err.message || 'Something went wrong!' });
// });

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './routes/auth.js';
import leetcodeRoutes from './routes/leetcode.js';
import morgan from 'morgan';
import './config/passport.js';

dotenv.config();

const app = express();

// CORS configuration - This should come BEFORE other middleware
app.use(cors({
  origin: 'http://127.0.0.1:5173', // Note: Changed from localhost to 127.0.0.1
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Remove the separate headers middleware since it's now handled by cors
app.use(express.json());
app.use(passport.initialize());
app.use(morgan("tiny"));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leetcode', leetcodeRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});