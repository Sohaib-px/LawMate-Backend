const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// 1. GET ALL POSTS WITH AUTHENTICATION CHECK (CRASH-PROOF)
exports.getPosts = async (req, res) => {
  try {
    // Direct posts fetch without crash-prone populate to ensure stability
    const posts = await Post.find()
      .sort({ createdAt: -1 }); // Latest First

    // Handle authentication state manually to check likes safely
    const authHeader = req.header('Authorization');
    let userId = null;
    
    if (authHeader) {
      try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        // Both object structures standard fallbacks
        userId = decoded.user?.id || decoded.id; 
      } catch (e) {
        // Token invalid hone par block crash nahi karega
      }
    }

    // Map through documents safely converting to JSON objects
    const formattedPosts = posts.map(p => {
      const obj = p.toObject ? p.toObject() : p;
      
      // Ensure likedUsers array exists to prevent runtime mapping errors
      const likedArray = obj.likedUsers || [];
      obj.isLiked = userId ? likedArray.map(id => id?.toString()).includes(userId.toString()) : false;
      return obj;
    });

    res.json(formattedPosts);
  } catch (err) {
    console.error("Feed Controller GET Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 2. CREATE A NEW POST
exports.createPost = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Instantiating standard Mongoose model document layout
    const newPost = new Post({
      user: user._id, // Standard field convention fallback
      authorName: user.name || `${user.firstName} ${user.lastName}`,
      authorRole: user.role,
      authorPic: user.profilePic,
      content: req.body.content,
      imageUrl: req.body.imageUrl,
      tag: req.body.tag,
      likes: 0,
      likedUsers: []
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error("Feed Controller POST Error:", err.message);
    res.status(500).send('Server error');
  }
};

// 3. LIKE / UNLIKE POST TOGGLE MECHANIC
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: 'Post not found' });

    // MongoDB arrays keep objectIds, converting them to strings to compare safely
    let likedUsers = post.likedUsers || [];
    const userId = req.user.id;
    const userIndex = likedUsers.map(id => id?.toString()).indexOf(userId.toString());

    let isLiked = false;
    if (userIndex > -1) {
      // Already liked, so UNLIKE it
      likedUsers.splice(userIndex, 1);
      post.likes = Math.max(0, (post.likes || 0) - 1);
    } else {
      // Not liked yet, so LIKE it
      likedUsers.push(userId);
      post.likes = (post.likes || 0) + 1;
      isLiked = true;
    }

    // Reassigning modified data structure back to document wrapper
    post.likedUsers = likedUsers;
    await post.save();

    res.json({ likes: post.likes, isLiked });
  } catch (err) {
    console.error("Feed Controller LIKE Error:", err.message);
    res.status(500).send('Server error');
  }
};