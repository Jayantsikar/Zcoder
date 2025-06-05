const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');

const jwt = require('jsonwebtoken');

const http = require('http');
const socketIo = require('socket.io');
 
const PORT = 4003;
dotenv.config();
const app = express();

app.use(cors({
  origin: 'http://localhost:4003',
  credentials: true
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:4003", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB Error:", err));

// Schema
const User = mongoose.model("User", new mongoose.Schema({
  // Authentication fields
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Profile information
  username: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  avatarInitials: { type: String, default: "AK" },
  country: String,
  university: String,
  major: String,
  
  // Coding stats (default values)
  problemsSolved: { type: Number, default: 0 },
  currentStreak: { type: Number, default: 0 },
  // ... rest of your schema
}, { timestamps: true }));


// Bookmark Schema
const bookmarkSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    questionId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    tags: [{
        type: String
    }],
    notes: {
        type: String,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastAccessed: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  username: { type: String, required: true, default: "Anonymous" }, 
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);


// Compound index to prevent duplicate bookmarks for same user
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Authentication middleware
const authenticateToken = (req, res, next) => {
  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }

  // 2. Extract and validate token structure
  const token = authHeader.split(' ')[1].trim();
  console.log('Received token:', token);
  if (!token || token.split('.').length !== 3) {
    return res.status(401).json({ error: 'Malformed token' });
  }

  // 3. Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Routes
// Proper login endpoint that returns JSON
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email , username: user.username}, // Payload
      process.env.JWT_SECRET,               // Secret key
      { expiresIn: '1h' }                   // Expiry
    );

    console.log('Generated token:', token); // 

    console.log('hii '); // 
    res.json({ 
      success: true,
      token,   // Send token to client
      user: {  // Optionally send user data (without password)
        _id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/signup', async (req, res) => {
  try {
    console.log('Received signup data:', req.body);
    
    const { username, email, password, firstName, lastName, country, university, major } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email ? 'Email already exists' : 'Username already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with all fields
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      country,
      university,
      major,
      avatarInitials: (firstName?.charAt(0) || '') + (lastName?.charAt(0) || '') || 'AK'
    });

    await newUser.save();
    console.log('User created:', newUser);
    res.redirect('/login.html');
    
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ error: errors.join(', ') });
    }
    
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Bookmark Routes

// Get all bookmarks for user
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
    try {
        const bookmarks = await Bookmark.find({ userId: req.user._id })
            .sort({ createdAt: -1 });
        
        res.json({
            bookmarks,
            count: bookmarks.length
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }
});

// Add bookmark
app.post('/api/bookmarks', authenticateToken, async (req, res) => {
    try {
        const { questionId, title, difficulty, tags, notes } = req.body;

        if (!questionId || !title) {
            return res.status(400).json({ error: 'Question ID and title are required' });
        }

        // Check if bookmark already exists
        const existingBookmark = await Bookmark.findOne({
            userId: req.user._id,
            questionId
        });

        if (existingBookmark) {
            return res.status(400).json({ error: 'Question already bookmarked' });
        }

        const bookmark = new Bookmark({
            userId: req.user._id,
            questionId,
            title,
            difficulty: difficulty || 'Easy',
            tags: tags || [],
            notes: notes || ''
        });

        await bookmark.save();

        res.status(201).json({
            message: 'Bookmark added successfully',
            bookmark
        });
    } catch (error) {
        console.error('Add bookmark error:', error);
        res.status(500).json({ error: 'Failed to add bookmark' });
    }
});

// Update bookmark
app.put('/api/bookmarks/:questionId', authenticateToken, async (req, res) => {
    try {
        const { questionId } = req.params;
        const { notes, tags, difficulty } = req.body;

        const bookmark = await Bookmark.findOneAndUpdate(
            { userId: req.user._id, questionId },
            { 
                notes,
                tags,
                difficulty,
                lastAccessed: new Date()
            },
            { new: true }
        );

        if (!bookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.json({
            message: 'Bookmark updated successfully',
            bookmark
        });
    } catch (error) {
        console.error('Update bookmark error:', error);
        res.status(500).json({ error: 'Failed to update bookmark' });
    }
});

// Clear all bookmarks
app.delete('/api/bookmarks/clear', authenticateToken, async (req, res) => {
    try {
        await Bookmark.deleteMany({ userId: req.user._id });
        res.json({ message: 'All bookmarks cleared successfully' });
    } catch (error) {
        console.error('Clear bookmarks error:', error);
        res.status(500).json({ error: 'Failed to clear bookmarks' });
    }
});

// Remove bookmark
app.delete('/api/bookmarks/:questionId', authenticateToken, async (req, res) => {
    try {
        const { questionId } = req.params;

        const bookmark = await Bookmark.findOneAndDelete({
            userId: req.user._id,
            questionId
        });

        if (!bookmark) {
            return res.status(404).json({ error: 'Bookmark not found' });
        }

        res.json({
            message: 'Bookmark removed successfully'
        });
    } catch (error) {
        console.error('Remove bookmark error:', error);
        res.status(500).json({ error: 'Failed to remove bookmark' });
    }
});

// Check if question is bookmarked
app.get('/api/bookmarks/:questionId', authenticateToken, async (req, res) => {
    try {
        const { questionId } = req.params;

        const bookmark = await Bookmark.findOne({
            userId: req.user._id,
            questionId
        });

        res.json({
            isBookmarked: !!bookmark,
            bookmark: bookmark || null
        });
    } catch (error) {
        console.error('Check bookmark error:', error);
        res.status(500).json({ error: 'Failed to check bookmark status' });
    }
});

// Update last accessed time
app.patch('/api/bookmarks/:questionId/access', authenticateToken, async (req, res) => {
    try {
        const { questionId } = req.params;

        await Bookmark.findOneAndUpdate(
            { userId: req.user._id, questionId },
            { lastAccessed: new Date() }
        );

        res.json({ message: 'Access time updated' });
    } catch (error) {
        console.error('Update access time error:', error);
        res.status(500).json({ error: 'Failed to update access time' });
    }
});

// Get bookmark statistics
app.get('/api/bookmarks/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await Bookmark.aggregate([
            { $match: { userId: req.user._id } },
            {
                $group: {
                    _id: '$difficulty',
                    count: { $sum: 1 }
                }
            }
        ]);

        const totalBookmarks = await Bookmark.countDocuments({ userId: req.user._id });
        
        const recentBookmarks = await Bookmark.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('questionId title createdAt');

        res.json({
            total: totalBookmarks,
            byDifficulty: stats,
            recent: recentBookmarks
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});
io.on('connection', (socket) => {
    socket.on('new-comment', async (commentData) => {
        try {
            // Save to database
            const newComment = await Comment.create(commentData);
            
            // Broadcast to all clients in the question room
            io.to(commentData.questionId).emit('comment-added', {
                ...newComment.toObject(),
                username: commentData.username
            });
        } catch (error) {
            console.error('Error saving comment:', error);
        }
    });
});

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// GET previous comments
app.get('/api/comments', async (req, res) => {
    try {
        const { questionId } = req.query;
        if (!questionId) {
          return res.status(400).json({ error: 'questionId is required' });
        }

        const comments = await Comment.find({
            questionId: req.query.questionId
        }).sort({ createdAt: -1 }); // Newest first
        res.json(comments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load comments' });
    }
});

// POST new comment
app.post('/api/comments', authenticateToken, async (req, res) => {
    try {
        const newComment = await Comment.create({
            questionId: req.body.questionId,
            userId: req.user._id, // From JWT
            username: req.user.username,
            text: req.body.text
        });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save comment' });
    }
});


server.listen(PORT, () => {
  console.log(`Server running with WebSockets on port ${PORT}`);
});