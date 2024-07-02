const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config(); // Load environment variables

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Database connected successfully for student population script');
  checkAndPopulateStudents();
}).catch(err => {
  console.error('Database connection error in populateStudents script:', err.message);
  console.error(err.stack);
});

async function checkAndPopulateStudents() {
  const studentCount = await User.countDocuments({ role: 'Student' });
  if (studentCount === 0) {
    console.log('No student data found, populating database...');
    populateStudents();
  } else {
    console.log('Student data already exists, skipping population.');
  }
}

async function populateStudents() {
  try {
    // Pre-hash passwords
    const hashedPasswords = {
      johnDoe: await bcrypt.hash('password123', 10),
      janeSmith: await bcrypt.hash('password123', 10),
      aliceJohnson: await bcrypt.hash('password123', 10)
    };

    // Sample data for students
    const studentsData = [
      {
        username: 'john.doe',
        password: hashedPasswords.johnDoe,
        fullName: 'John Doe',
        nationalNumber: '1234567890',
        phoneNumber: '123-456-7890',
        class: '10A',
        role: 'Student',
        status: 'Ready to Pick Up'
      },
      {
        username: 'jane.smith',
        password: hashedPasswords.janeSmith,
        fullName: 'Jane Smith',
        nationalNumber: '0987654321',
        phoneNumber: '987-654-3210',
        class: '10B',
        role: 'Student',
        status: 'Late'
      },
      {
        username: 'alice.johnson',
        password: hashedPasswords.aliceJohnson,
        fullName: 'Alice Johnson',
        nationalNumber: '1122334455',
        phoneNumber: '132-465-7980',
        class: '9A',
        role: 'Student',
        status: 'Student Called'
      }
    ];

    // Insert students into the database
    for (const student of studentsData) {
      const existingUser = await User.findOne({ nationalNumber: student.nationalNumber });
      if (!existingUser) {
        await User.create(student);
        console.log(`Student created: ${student.fullName}`);
      } else {
        console.log(`Student already exists: ${student.fullName}`);
      }
    }
    console.log('All students have been populated successfully');
  } catch (error) {
    console.error('Error populating students:', error.message);
    console.error(error.stack);
  } finally {
    mongoose.disconnect().then(() => console.log('Database connection closed after population'));
  }
}