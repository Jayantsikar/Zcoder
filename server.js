const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();
const app = express();
const PORT = 3001;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("DB Error:", err));

// Schema
const User = mongoose.model("User", new mongoose.Schema({
  email: String,
  password: String,
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) {
    res.redirect('/success.html');
  } else {
    res.send('<script>alert("Invalid credentials");window.location="/login.html";</script>');
  }
});

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    res.send('<script>alert("User already exists");window.location="/signup.html";</script>');
  } else {
    await new User({ email, password }).save();
    res.redirect('/login.html');
  }
});


// Serve home page at '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
