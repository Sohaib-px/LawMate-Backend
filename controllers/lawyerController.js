const User = require('../models/User');

// 1. Get Lawyers with Filters (City, Specialization, Max Fee)
exports.getLawyers = async (req, res) => {
  try {
    const { city, specialization, maxFee } = req.query;
    
    // Base filter: Sirf unhein lao jinka role 'lawyer' hai
    const query = { role: 'lawyer' };

    // Exact Match for City
    if (city) query.city = city;

    // MongoDB Regex (SQL k LIKE '%...%' ki jagah): 'i' ka matlab case-insensitive
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    // Less Than or Equal To ($lte) for Consultation Fee
    if (maxFee) {
      query.consultationFee = { $lte: Number(maxFee) };
    }

    // .find() use kiya aur password hatane k liye .select('-password') laga diya
    const lawyers = await User.find(query).select('-password');
    
    res.json(lawyers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

// 2. Get All Social Workers
exports.getSocialWorkers = async (req, res) => {
  try {
    // Mongoose query format
    const workers = await User.find({ role: 'social_worker' }).select('-password');
    res.json(workers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};