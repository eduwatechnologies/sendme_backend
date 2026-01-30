const Runner = require('../models/Runner');
const User = require('../models/User');

exports.apply = async (req, res) => {
  try {
    const { userId, vehicleType, location, relativePhone, nationalId } = req.body;
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already applied
    const existingRunner = await Runner.findOne({ user: userId });
    if (existingRunner) {
      return res.status(400).json({ message: 'Application already submitted' });
    }

    const nationalSlipImage = req.files['nationalSlipImage'] ? {
      name: req.files['nationalSlipImage'][0].originalname,
      path: req.files['nationalSlipImage'][0].path
    } : null;

    const photo = req.files['photo'] ? {
      name: req.files['photo'][0].originalname,
      path: req.files['photo'][0].path
    } : null;

    const runner = new Runner({
      user: userId,
      vehicleType,
      location,
      relativePhone,
      nationalId,
      nationalSlipImage,
      photo
    });

    await runner.save();
    
    // Optionally update user role to 'runner' immediately or keep as 'user' until approved
    // For now, let's keep it pending.
    
    res.status(201).json({ message: 'Application submitted successfully', runner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
