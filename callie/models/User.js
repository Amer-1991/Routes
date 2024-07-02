const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Changed from bcrypt to bcryptjs

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['Guardian', 'Super Admin', 'School Admin', 'Security Guard', 'Student'] },
  fullName: { type: String, required: true },
  nationalNumber: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  class: { type: String }, // Optional, only required for students
  guardianId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to the guardian, applicable for students
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    next();
  } catch (err) {
    console.error('Error hashing password:', err.message, err.stack);
    next(err);
  }
});

const User = mongoose.model('User', userSchema);

// Function to process CSV data and update student-guardian relationships
User.processCsvData = async function(csvData) {
  try {
    const updatePromises = csvData.map(async (row) => {
      const { studentNationalNumber, guardianNationalNumber } = row;
      const guardian = await this.findOne({ nationalNumber: guardianNationalNumber, role: 'Guardian' });
      if (!guardian) {
        throw new Error(`Guardian with national number ${guardianNationalNumber} not found`);
      }
      const student = await this.findOneAndUpdate(
        { nationalNumber: studentNationalNumber, role: 'Student' },
        { guardianId: guardian._id },
        { new: true }
      );
      if (!student) {
        throw new Error(`Student with national number ${studentNationalNumber} not found`);
      }
      console.log(`Updated student ${student.fullName} with guardian ${guardian.fullName}`);
    });
    await Promise.all(updatePromises);
    console.log('All student-guardian relationships have been updated successfully.');
  } catch (error) {
    console.error('Error processing CSV data:', error.message, error.stack);
    throw error;
  }
};

module.exports = User;