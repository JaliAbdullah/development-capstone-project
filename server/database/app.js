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

// In-memory data fallback
let inMemoryDealerships = [];
let inMemoryReviews = [];
let useInMemory = false;

// Connect to MongoDB with fallback
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  connectTimeoutMS: 5000,
})
  .then(async () => {
    console.log(`✅ Connected to MongoDB at ${MONGO_URI}`);
    await populateData();
  })
  .catch(async (err) => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('🔄 Falling back to in-memory data...');
    useInMemory = true;
    await loadInMemoryData();
  });

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

// Load data into memory for fallback
async function loadInMemoryData() {
  try {
    inMemoryDealerships = dealerships_data['dealerships'] || [];
    inMemoryReviews = reviews_data['reviews'] || [];
    console.log(`✅ Loaded ${inMemoryDealerships.length} dealerships into memory`);
    console.log(`✅ Loaded ${inMemoryReviews.length} reviews into memory`);
  } catch (error) {
    console.error('❌ Error loading in-memory data:', error);
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
    if (useInMemory) {
      const dealerCount = inMemoryDealerships.length;
      res.json({ message: 'Test successful (in-memory mode)', dealerCount });
    } else {
      const dealerCount = await Dealerships.countDocuments();
      res.json({ message: 'Test successful', dealerCount });
    }
  } catch (error) {
    res.status(500).json({ error: 'Test failed', details: error.message });
  }
});

// Get all dealers
app.get('/dealers', async (req, res) => {
  console.log('🔍 Request received on /dealers endpoint');
  try {
    if (useInMemory) {
      console.log('📄 Using in-memory data for dealers');
      res.json(inMemoryDealerships);
    } else {
      const documents = await Dealerships.find();
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching dealers:', error);
    if (useInMemory) {
      res.json(inMemoryDealerships);
    } else {
      res.status(500).json({ error: 'Failed to fetch dealers' });
    }
  }
});

// Get dealer by ID
app.get('/dealers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (useInMemory) {
      const documents = inMemoryDealerships.filter(dealer => dealer.id === id);
      res.json(documents);
    } else {
      const documents = await Dealerships.find({ id });
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching dealer by ID:', error);
    res.status(500).json({ error: 'Failed to fetch dealer by ID' });
  }
});

// Get dealers by state
app.get('/dealers/state/:state', async (req, res) => {
  try {
    const state = req.params.state;
    if (useInMemory) {
      const documents = inMemoryDealerships.filter(dealer => dealer.state === state);
      res.json(documents);
    } else {
      const documents = await Dealerships.find({ state });
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching dealers by state:', error);
    res.status(500).json({ error: 'Failed to fetch dealers by state' });
  }
});

// Get all reviews
app.get('/reviews', async (req, res) => {
  try {
    if (useInMemory) {
      res.json(inMemoryReviews);
    } else {
      const documents = await Reviews.find();
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Get reviews by dealer ID
app.get('/reviews/dealer/:id', async (req, res) => {
  try {
    if (useInMemory) {
      const documents = inMemoryReviews.filter(review => review.dealership == req.params.id);
      res.json(documents);
    } else {
      const documents = await Reviews.find({ dealership: req.params.id });
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Insert a new review
app.post('/reviews', async (req, res) => {
  try {
    if (useInMemory) {
      // Get the next ID
      const maxId = inMemoryReviews.length > 0 ? Math.max(...inMemoryReviews.map(r => r.id)) : 0;
      const new_id = maxId + 1;
      
      const newReview = {
        id: new_id,
        name: req.body.name,
        dealership: parseInt(req.body.dealership),
        review: req.body.review,
        purchase: req.body.purchase,
        purchase_date: req.body.purchase_date,
        car_make: req.body.car_make,
        car_model: req.body.car_model,
        car_year: parseInt(req.body.car_year),
      };
      
      inMemoryReviews.push(newReview);
      res.json(newReview);
    } else {
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
    }
  } catch (error) {
    console.error('Error inserting review:', error);
    res.status(500).json({ error: 'Error inserting review' });
  }
});

// Fetch all reviews
app.get('/fetchReviews', async (req, res) => {
  try {
    if (useInMemory) {
      res.json(inMemoryReviews);
    } else {
      const documents = await Reviews.find();
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Fetch reviews by dealer ID
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    if (useInMemory) {
      const documents = inMemoryReviews.filter(review => review.dealership == req.params.id);
      res.json(documents);
    } else {
      const documents = await Reviews.find({ dealership: req.params.id });
      res.json(documents);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
});

// Django-compatible endpoints
// Fetch all dealers (Django expects this endpoint)
app.get('/fetchDealers', async (req, res) => {
  try {
    if (useInMemory) {
      console.log('📄 Using in-memory data for fetchDealers');
      res.json(inMemoryDealerships);
    } else {
      const documents = await Dealerships.find();
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching dealers:', error);
    if (useInMemory) {
      res.json(inMemoryDealerships);
    } else {
      res.status(500).json({ error: 'Failed to fetch dealers' });
    }
  }
});

// Fetch dealers by state (Django expects this endpoint)
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    if (useInMemory) {
      const documents = inMemoryDealerships.filter(dealer => dealer.state === state);
      res.json(documents);
    } else {
      const documents = await Dealerships.find({ state });
      res.json(documents);
    }
  } catch (error) {
    console.error('Error fetching dealers by state:', error);
    res.status(500).json({ error: 'Failed to fetch dealers by state' });
  }
});

// Fetch dealer by ID (Django expects this endpoint)
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const dealerId = parseInt(req.params.id);
    if (useInMemory) {
      const dealer = inMemoryDealerships.find(dealer => dealer.id === dealerId);
      if (dealer) {
        res.json(dealer);
      } else {
        res.status(404).json({ error: 'Dealer not found' });
      }
    } else {
      const dealer = await Dealerships.findOne({ id: dealerId });
      if (dealer) {
        res.json(dealer);
      } else {
        res.status(404).json({ error: 'Dealer not found' });
      }
    }
  } catch (error) {
    console.error('Error fetching dealer by ID:', error);
    res.status(500).json({ error: 'Failed to fetch dealer by ID' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
