const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. REGISTER USER
exports.register = async (req, res) => {
  const {
    firstName, lastName, email, password, role, phone, profilePic, username,
    dob, gender, barNumber, barCouncil, specialization, yearsExp, consultationFee,
    city, bio, languages, isAvailable, casesHandled, workType, organization, fee, helpedCount
  } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    let user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Dynamic generation: firstName aur lastName ko jod kar full name auto-populate kar diya
    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Anonymous User';

    user = new User({
      name: fullName, // Schema validation ki strictness khatam karne k liye yahan name pass kar diya
      firstName, 
      lastName, 
      email: email.toLowerCase().trim(), 
      password: hashedPassword,
      role: role || 'user', phone, profilePic, username, dob, gender,
      barNumber, barCouncil, specialization, yearsExp, consultationFee, city, bio,
      languages, isAvailable, casesHandled, workType, organization, fee, helpedCount
    });

    await user.save();

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, role: user.role, user: userObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. LOGIN USER
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  try {
    if (!email || !password) return res.status(400).json({ msg: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });
    if (role && user.role !== role) return res.status(400).json({ msg: `Please login as ${user.role}` });

    const payload = { user: { id: user._id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, role: user.role, user: userObj });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 3. GET CURRENT USER PROFILE (ME)
exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};