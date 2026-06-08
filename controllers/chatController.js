const ChatMessage = require('../models/ChatMessage');

const replies = [
  'Please share a few more details so I can guide you better.',
  'For this matter, collect your documents and consult a qualified lawyer before filing.',
  'Under Pakistani law, you generally have the right to legal representation and due process.',
  'This sounds time-sensitive. Consider contacting the nearest legal aid office or bar council helpline.',
];

// 1. SEND MESSAGE & GET BOT REPLY (100% SYNCED)
exports.sendMessage = async (req, res) => {
  try {
    // Postman ya frontend se 'message' ya 'content' kuch bhi aaye, handle ho jayega
    const messageText = (req.body.message || req.body.content || '').trim();
    if (!messageText) return res.status(400).json({ msg: 'Message is required' });

    if (req.user?.id) {
      // Dono fields assign kar di hain taa ke Mongoose validation pass ho jaye
      const newChat = new ChatMessage({
        content: messageText, 
        message: messageText, 
        senderId: req.user.id,
        receiverId: req.user.id,
      });
      await newChat.save();
    }

    const reply = replies[Math.floor(Math.random() * replies.length)];
    res.json({ reply });
  } catch (err) {
    console.error("Chat Controller POST Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 2. GET CHAT HISTORY
exports.history = async (req, res) => {
  try {
    const messages = await ChatMessage.find({ senderId: req.user.id })
      .sort({ createdAt: 1 }); // Oldest first (Standard chat timeline)

    res.json(messages);
  } catch (err) {
    console.error("Chat History GET Error:", err.message);
    res.status(500).send('Server error');
  }
};