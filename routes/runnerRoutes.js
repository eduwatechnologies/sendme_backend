const express = require('express');
const router = express.Router();
const multer = require('multer');
const { apply } = require('../controllers/runnerController');
const path = require('path');

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/apply', upload.fields([
  { name: 'nationalSlipImage', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), apply);

module.exports = router;
