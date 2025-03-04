const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
async function showCollections() {
  try {
    // Connect to MongoDB first
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/support-bot');
    console.log('Connected to MongoDB');
    
    // Wait a moment to ensure connection is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    console.log('\n===== MONGODB COLLECTIONS =====\n');
    
    if (collections.length === 0) {
      console.log('No collections found in the database.');
    } else {
      for (const collection of collections) {
        console.log(`Collection: ${collection.name}`);
        
        // Get sample document to show structure
        const sampleDocs = await mongoose.connection.db.collection(collection.name)
          .find({}).limit(1).toArray();
          
        if (sampleDocs.length > 0) {
          console.log('Document structure:');
          console.log(JSON.stringify(sampleDocs[0], null, 2));
        } else {
          console.log('No documents in this collection');
        }
        console.log('-----------------------------------');
      }
    }
    
  } catch (error) {
    console.error('Error fetching collections:', error);
  } finally {
    // Always close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Execute the function
showCollections();