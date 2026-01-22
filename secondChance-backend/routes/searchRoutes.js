const express = require('express');
const router = express.Router();
const connectToDatabase = require('../models/db');

// Search for gifts
router.get('/', async (req, res, next) => {
    try {
      // Task 1: Connect to MongoDB
      const db = await connectToDatabase();
    
  
      const collection = db.collection(process.env.MONGO_COLLECTION);
  
      // Initialize the query object
      let query = {};
  
      // Task 2: Add name filter if present
      if (req.query.name) {
        query.name = { $regex: req.query.name, $options: 'i' };
      }
  
      // Task 3: Add other filters
      if (req.query.category) {
        query.category = req.query.category;
      }
  
      if (req.query.condition) {
        query.condition = req.query.condition;
      }
  
      if (req.query.age_years) {
        query.age_years = { $lte: parseInt(req.query.age_years) };
      }
  
      // Task 4: Fetch filtered gifts
      const gifts = await collection.find(query).toArray();
  
      res.json(gifts);
    } catch (e) {
      next(e);
    }
  });
  

module.exports = router;
