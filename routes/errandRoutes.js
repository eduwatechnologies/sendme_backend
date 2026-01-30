const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getErrands, getErrandById, createErrand, updateErrandStatus } = require('../controllers/errandController');

// @route   GET api/errands
// @desc    Get all errands
// @access  Private
router.get('/', auth, getErrands);

// @route   GET api/errands/:id
// @desc    Get single errand
// @access  Private
router.get('/:id', auth, getErrandById);

// @route   POST api/errands
// @desc    Create an errand
// @access  Private
router.post('/', auth, createErrand);

// @route   PUT api/errands/:id/status
// @desc    Update errand status
// @access  Private
router.put('/:id/status', auth, updateErrandStatus);

// @route   GET api/errands/users/:userId
// @desc    Get errands between current user and another user
// @access  Private
const { getErrandsBetweenUsers } = require('../controllers/errandController');
router.get('/users/:userId', auth, getErrandsBetweenUsers);

module.exports = router;
