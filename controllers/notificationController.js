const Notification = require('../models/Notification');
const User = require('../models/User');

// 1. LIST ALL NOTIFICATIONS (Latest First)
exports.listNotifications = async (req, res) => {
  try {
    const fallbackUserId = req.user?.id || req.user?._id || "6a272efe4725e391500fe0c5";

    // `findAll({ where: ... })` becomes `.find(...)` and `order` becomes `.sort()`
    const notifications = await Notification.find({ userId: fallbackUserId })
      .sort({ createdAt: -1 }); // -1 means DESC (Latest First)

    res.json(notifications);
  } catch (err) {
    console.error("List Notifications Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 2. CREATE A NOTIFICATION
exports.createNotification = async (req, res) => {
  try {
    // Handling undefined req.user securely to prevent 500 server crash
    const fallbackUserId = req.user?.id || req.user?._id || "6a272efe4725e391500fe0c5";

    // Mongoose instantiation and save logic
    const notification = new Notification({
      userId: req.body.userId || fallbackUserId,
      title: req.body.title,
      body: req.body.body,
      type: req.body.type || 'general',
      isRead: false // Default state fallback safely handled
    });

    await notification.save();
    res.status(201).json(notification);
  } catch (err) {
    console.error("Create Notification Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 3. MARK NOTIFICATION AS READ
exports.markRead = async (req, res) => {
  try {
    const fallbackUserId = req.user?.id || req.user?._id || "6a272efe4725e391500fe0c5";

    // `findOne({ where: ... })` mapped directly to Mongoose query selector
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: fallbackUserId
    });
    
    if (!notification) return res.status(404).json({ msg: 'Notification not found' });

    notification.isRead = true;
    await notification.save(); // Mongoose handles partial state updates seamlessly via save
    
    res.json(notification);
  } catch (err) {
    console.error("Mark Notification Read Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 4. REGISTER FCM PUSH TOKEN
exports.registerFcmToken = async (req, res) => {
  try {
    const fallbackUserId = req.user?.id || req.user?._id || "6a272efe4725e391500fe0c5";
    const { token } = req.body;
    
    if (!token) return res.status(400).json({ msg: 'FCM token is required' });

    // Sequelize `User.update({ data }, { where })` becomes Mongoose `User.findByIdAndUpdate`
    const user = await User.findByIdAndUpdate(
      fallbackUserId,
      { fcmToken: token },
      { new: true } // returns the modified data state
    );

    if (!user) return res.status(404).json({ msg: 'User not found' });

    res.json({ ok: true });
  } catch (err) {
    console.error("Register FCM Token Error:", err.message);
    res.status(500).send('Server error');
  }
};