const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['fundraiser', 'bank', 'admin']
  }
});

// Hash password before saving it to the database
userSchema.pre('save', async function(next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const hashRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10; // INPUT_REQUIRED {Please ensure BCRYPT_ROUNDS is set in your .env file}
      this.password = await bcrypt.hash(this.password, hashRounds);
      console.log('Password hashed successfully');
    } catch (error) {
      console.error(`Error in pre-save hashing: ${error.message}\n${error.stack}`, error);
      next(error);
    }
  } else {
    next();
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;