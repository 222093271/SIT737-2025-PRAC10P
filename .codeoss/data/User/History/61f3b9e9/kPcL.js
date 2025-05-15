// application.js
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

// Pull in the single connection URI from env
const { MONGO_URI, PORT = 3000 } = process.env;

// application.js (snippet)
const DB_TYPE = process.env.DB_TYPE;            // "mongodb"
const MONGODB_URI = process.env.MONGO_URI;      // Atlas URI
const MONGO_DB_NAME = process.env.MONGO_DB_NAME; // "registrationdb"


if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in environment");
  process.exit(1);
}

// Connect to MongoDB Atlas via the full URI
mongoose
  .connect(MONGODB_URI, {
    dbName: MONGO_DB_NAME,
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log(`✅ Connected to ${DB_TYPE}://${MONGO_DB_NAME}`))
  .catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Define the User schema & model
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  password: String,
  phone: String,
});
const User = mongoose.model("User", userSchema);

// Create Express app
const app = express();

// Serve static files from `public/` (your frontend)
app.use(express.static(path.join(__dirname, "public")));

// Parse JSON bodies
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).send('Backend is running');
  });
  
// Registration endpoint
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const user = new User({ name, email, password, phone });
    await user.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: "Email already exists" });
    } else {
      console.error("❌ Registration error:", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// Start HTTP server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
