const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017').then(() => {
  console.log('Connected to MongoDB');
  verifyCollections();
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

async function verifyCollections() {
  try {
    console.log('\n🔍 Verifying all collections...\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📋 Collections found:');
    collections.forEach(collection => {
      console.log(`   - ${collection.name}`);
    });

    console.log('\n📊 Collection Statistics:');
    
    // Check each collection
    const collectionNames = ['users', 'talentprofiles', 'jobpostings', 'screeningsessions', 'screeningresults'];
    
    for (const name of collectionNames) {
      try {
        const collection = db.collection(name);
        const count = await collection.countDocuments();
        console.log(`   ${name}: ${count} documents`);
        
        // Show a sample document for each collection
        if (count > 0) {
          const sample = await collection.findOne();
          console.log(`      Sample keys: ${Object.keys(sample).join(', ')}`);
        }
      } catch (error) {
        console.log(`   ${name}: Error accessing collection - ${error.message}`);
      }
    }

    console.log('\n✅ Collection verification completed!');
    console.log('\n🌐 Database is ready for use with the Umurava AI Talent Screening Tool');
    
  } catch (error) {
    console.error('Error verifying collections:', error);
  } finally {
    mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}
