const Errand = require('../models/Errand');

// Get all errands (with optional filtering)
exports.getErrands = async (req, res) => {
  try {
    const errands = await Errand.find()
      .populate('user', 'name email photo')
      .populate('runner', 'name email photo')
      .sort({ createdAt: -1 });
    res.json(errands);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get single errand by ID
exports.getErrandById = async (req, res) => {
  try {
    const errand = await Errand.findById(req.params.id)
      .populate('user', 'name email photo')
      .populate('runner', 'name email photo');
    
    if (!errand) {
      return res.status(404).json({ msg: 'Errand not found' });
    }
    
    res.json(errand);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Errand not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Create a new errand
exports.createErrand = async (req, res) => {
  try {
    const { title, description, pickup, dropoff, price } = req.body;

    // Generate a simple 8-character alphanumeric tracking ID
    const trackingId = Math.random().toString(36).substring(2, 10).toUpperCase();

    const newErrand = new Errand({
      user: req.user.id,
      title,
      description,
      pickup,
      dropoff,
      price,
      trackingId
    });

    const errand = await newErrand.save();
    await errand.populate('user', 'name email photo');
    
    res.json(errand);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Update errand status (Accept, Complete)
exports.updateErrandStatus = async (req, res) => {
  try {
    const { status } = req.body;
    let errand = await Errand.findById(req.params.id);

    if (!errand) {
      return res.status(404).json({ msg: 'Errand not found' });
    }

    // Logic for runner accepting an errand
    if (status === 'Accepted') {
        if (errand.status !== 'Pending') {
             return res.status(400).json({ msg: 'Errand is not available' });
        }
        errand.runner = req.user.id;
        errand.status = 'Accepted';
    }
    // Logic for user confirming (starting) the errand (after payment)
    else if (status === 'In Progress') {
        // Only the creator can start it
        if (errand.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized to start this errand' });
        }
        errand.status = 'In Progress';
    }
    // Logic for completion or cancellation
    else if (status === 'Pending') {
        // If reverting to pending (Rejecting runner), clear the runner
        errand.runner = null;
        errand.status = 'Pending';
    }
    else {
        errand.status = status;
    }

    await errand.save();

    await errand.populate('user', 'name email photo');
    await errand.populate('runner', 'name email photo');

    res.json(errand);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get errands between current user and another user
exports.getErrandsBetweenUsers = async (req, res) => {
    try {
        const otherUserId = req.params.userId;
        const currentUserId = req.user.id;

        const errands = await Errand.find({
            $or: [
                { user: currentUserId, runner: otherUserId },
                { user: otherUserId, runner: currentUserId }
            ]
        })
        .sort({ createdAt: -1 });

        res.json(errands);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
