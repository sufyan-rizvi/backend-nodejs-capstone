const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const connectToDatabase = require('../models/db');
const logger = require('../logger');

// Define the upload directory path
const directoryPath = 'public/images';

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, directoryPath); // Specify the upload directory
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage });


// Get all secondChanceItems
router.get('/', async (req, res, next) => {
    logger.info('/ called');
    try {
        const db = await connectToDatabase()

        const collection = db.collection("secondChanceItems");
        const secondChanceItems = await collection.find({}).toArray();
        res.json(secondChanceItems);
    } catch (e) {
        logger.console.error('oops something went wrong', e)
        next(e);
    }
});

// Add a new item
// Add a new item
router.post(
    '/',
    upload.single('image'), // Task 7: handle image upload
    async (req, res, next) => {
      try {
        // Task 1: Connect to MongoDB
        const db = await connectToDatabase();
  
        // Task 2: Get collection
        const collection = db.collection('secondChanceItems');
  
        // Task 3: Create new item from request body
        const newSecondChanceItem = req.body
  
        // Task 4: Get last id and increment
        const lastItem = await collection
          .find()
          .sort({ id: -1 })
          .limit(1)
          .toArray();
  
        const newId = lastItem.length > 0 ? lastItem[0].id + 1 : 1;
        newSecondChanceItem.id = newId;
  
        // Task 5: Set current date
        newSecondChanceItem.dateCreated = new Date();
  
        // If image uploaded, save image path
        if (req.file) {
          newSecondChanceItem.image = `/images/${req.file.originalname}`;
        }
  
        // Task 6: Insert into DB
        const result = await collection.insertOne(newSecondChanceItem);
  
        // Respond with created item
        res.status(201).json(result.ops[0]);
      } catch (e) {
        next(e);
      }
    }
  );
  

// Get a single secondChanceItem by ID
// Get a single secondChanceItem by ID
router.get('/:id', async (req, res, next) => {
    try {
      // Step 4: Task 1 - connect to database
      const db = await connectToDatabase();
  
      // Step 4: Task 2 - get collection
      const collection = db.collection('secondChanceItems');
  
      // Step 4: Task 3 - find item by id
      const id = parseInt(req.params.id);
      const secondChanceItem = await collection.findOne({ id: id });
  
      // Step 4: Task 4 - return result or error
      if (!secondChanceItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      res.json(secondChanceItem);
    } catch (e) {
      next(e);
    }
  });
  

// Update and existing item
// Update an existing item
router.put('/:id', async (req, res, next) => {
    try {
      // Step 5: Task 1 - connect to database
      const db = await connectToDatabase();
  
      // Step 5: Task 2 - get collection
      const collection = db.collection('secondChanceItems');
  
      const id = parseInt(req.params.id);
  
      // Step 5: Task 3 - check if item exists
      const existingItem = await collection.findOne({ id: id });
  
      if (!existingItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Step 5: Task 4 - update specific attributes
      const { category, condition, age_days, description } = req.body;
  
      const age_years = Number((age_days / 365).toFixed(1));
  
      const updatedItem = {
        category,
        condition,
        age_days,
        age_years,
        description,
        updatedAt: new Date(),
      };
  
      await collection.updateOne(
        { id: id },
        { $set: updatedItem }
      );
  
      // Step 5: Task 5 - send confirmation
      res.json({ message: 'Item updated successfully' });
    } catch (e) {
      next(e);
    }
  });
  

// Delete an existing item
// Delete an existing item
router.delete('/:id', async (req, res, next) => {
    try {
      // Step 6: Task 1 - connect to database
      const db = await connectToDatabase();
  
      // Step 6: Task 2 - get collection
      const collection = db.collection('secondChanceItems');
  
      const id = parseInt(req.params.id);
  
      // Step 6: Task 3 - check if item exists
      const secondChanceItem = await collection.findOne({ id: id });
  
      if (!secondChanceItem) {
        return res.status(404).json({ message: 'Item not found' });
      }
  
      // Step 6: Task 4 - delete item
      await collection.deleteOne({ id: id });
  
      res.json({ message: 'Item deleted successfully' });
    } catch (e) {
      next(e);
    }
  });
  

module.exports = router;
