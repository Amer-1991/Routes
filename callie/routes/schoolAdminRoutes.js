const express = require('express');
const User = require('../models/User');
const fileUpload = require('express-fileupload');
const { isAuthenticated, roleCheck } = require('./middleware/authMiddleware');
const router = express.Router();

router.use(fileUpload());

// Endpoint to upload and process CSV files for student-guardian assignments
router.post('/uploadStudentGuardianData', isAuthenticated, roleCheck(['School Admin']), async (req, res) => {
  if (!req.files || !req.files.csvFile) {
    console.error('No file was uploaded.');
    return res.status(400).send('No file uploaded.');
  }

  const csvFile = req.files.csvFile;

  try {
    await User.processCsvData(csvFile.data.toString());
    console.log('Student-guardian relationships updated successfully.');
    res.send('Student-guardian relationships updated successfully.');
  } catch (error) {
    console.error('Error processing CSV data:', error.message, error.stack);
    res.status(500).send(`Error processing CSV data: ${error.message}`);
  }
});

module.exports = router;