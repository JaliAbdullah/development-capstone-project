const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 3030;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Models
const Reviews = require('./review');
const Dealerships = require('./dealership');

// Load JSON data
const reviews_data = JSON.parse(fs.readFileSync(path.join(__dirname, "data/reviews.json"), 'utf8'));
const dealerships_data = JSON.parse(fs.readFileSync(path.join(__dirname, "data/dealerships.json"), 'utf8'));

// MongoDB connection URI
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/dealershipsDB";

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log(`✅ Connected to MongoDB at ${MONGO_URI}`);
    await populateData();
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Populate MongoDB with initial JSON data
async function populateData() {
  try {
    console.log('⏳ Clearing and inserting fresh data...');
    await Reviews.deleteMany({});
    await Dealerships.deleteMany({});

    await Reviews.insertMany(reviews_data['reviews']);
    console.log(`✅ Inserted ${reviews_data['reviews'].length} reviews`);

    await Dealerships.insertMany(dealerships_data['dealerships']);
    console.log(`✅ Inserted ${dealerships_data['dealerships'].length} dealerships`);
  } catch (error) {
    console.error('❌ Error in data population:', error);
  }
}

// --- Routes ---

// Home route
app.get('/', (req, res) => {
  res.send("Welcome to the Dealerships API");
});

// Test route
app.get('/test', async (req, res) => {
  try {
    const dealerCount = await Dealerships.countDocuments();
    res.json({ message: 'Test successful', dealerCount });
  } catch (error) {
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Get all dealers
app.get('/dealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Get dealer by ID
app.get('/dealers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const documents = await Dealerships.find({ id });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealer by ID:', error);
    res.status(500).json({ error: 'Failed to fetch dealer by ID' });
  }
});

// Get dealers by state
app.get('/dealers/state/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const documents = await Dealerships.find({ state });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealers by state:', error);
    res.status(500).json({ error: 'Failed to fetch dealers by state' });
  }
});

// Get all reviews
app.get('/reviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Get reviews by dealer ID
app.get('/reviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Insert a new review
app.post('/reviews', async (req, res) => {
  try {
    const documents = await Reviews.find().sort({ id: -1 });
    const new_id = documents.length ? documents[0]['id'] + 1 : 1;

    const review = new Reviews({
      id: new_id,
      name: req.body.name,
      dealership: req.body.dealership,
      review: req.body.review,
      purchase: req.body.purchase,
      purchase_date: req.body.purchase_date,
      car_make: req.body.car_make,
      car_model: req.body.car_model,
      car_year: req.body.car_year,
    });

    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    console.error('Error inserting review:', error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// --- Additional endpoints with fetch prefix ---

// Fetch all dealers
app.get('/fetchDealers', async (req, res) => {
  try {
    const documents = await Dealerships.find();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealers:', error);
    res.status(500).json({ error: 'Failed to fetch dealers' });
  }
});

// Fetch dealer by ID
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const documents = await Dealerships.find({ id });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealer by ID:', error);
    res.status(500).json({ error: 'Failed to fetch dealer by ID' });
  }
});

// Fetch dealers by state
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const documents = await Dealerships.find({ state });
    res.json(documents);
  } catch (error) {
    console.error('Error fetching dealers by state:', error);
    res.status(500).json({ error: 'Failed to fetch dealers by state' });
  }
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    const documents = await Reviews.find();
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const documents = await Reviews.find({ dealership: req.params.id });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
