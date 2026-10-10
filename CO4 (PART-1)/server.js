import express from 'express';
import mongoose from 'mongoose';
import studentRoutes from './routes/studentRoutes.js';

const app = express();

const PORT = 3000;


// Middleware
app.use(express.json());


// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Student Records API is running'
  });
});


// Student routes
app.use('/students', studentRoutes);


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/student_records')
  .then(() => {

    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });

  })
  .catch((error) => {

    console.error(
      'MongoDB connection failed:',
      error.message
    );

  });