const mongoose = require('mongoose');

async function initDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/umurava-ai-hackathon');
    console.log('Connected to MongoDB');
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // Import models to create collections
    const { User } = require('./src/models/User');
    const { TalentProfile } = require('./src/models/TalentProfile');
    const { JobPosting } = require('./src/models/JobPosting');
    const { ScreeningResult } = require('./src/models/ScreeningResult');
    const { ScreeningSession } = require('./src/models/ScreeningSession');
    
    console.log('Models imported successfully');
    
    // List all collections after model initialization
    const collections = await db.listCollections().toArray();
    
    console.log('\n=== Collections After Initialization ===');
    const expectedCollections = [
      { name: 'users', model: 'User' },
      { name: 'talentprofiles', model: 'TalentProfile' },
      { name: 'jobpostings', model: 'JobPosting' },
      { name: 'screeningresults', model: 'ScreeningResult' },
      { name: 'screeningsessions', model: 'ScreeningSession' }
    ];
    
    for (const expected of expectedCollections) {
      const exists = collections.some(c => c.name === expected.name);
      const status = exists ? '✓ EXISTS' : '✗ MISSING';
      console.log(`${status} - ${expected.name} (${expected.model})`);
      
      if (exists) {
        // Get document count
        const count = await db.collection(expected.name).countDocuments();
        console.log(`    Documents: ${count}`);
      }
    }
    
    // Create demo data if collections are empty
    const allEmpty = expectedCollections.every(async (expected) => {
      const exists = collections.some(c => c.name === expected.name);
      if (exists) {
        const count = await db.collection(expected.name).countDocuments();
        return count === 0;
      }
      return false;
    });
    
    console.log('\n=== Database Status ===');
    if (collections.length === 0) {
      console.log('Database is empty - collections will be created on first use');
    } else {
      console.log('Collections are ready');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

initDatabase();
