const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/support-bot')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define your message schema (should match your application schema)
const messageSchema = new mongoose.Schema({
  userId: String,
  sessionId: String,
  message: String,
  timestamp: Date,
  isUserMessage: Boolean
});

const Message = mongoose.model('Message', messageSchema);

// Function to display all messages
async function displayMessages() {
  try {
    const messages = await Message.find().sort({ timestamp: -1 }).limit(50);
    
    console.log('\n===== RECENT MESSAGES IN MONGODB =====\n');
    
    if (messages.length === 0) {
      console.log('No messages found in the database.');
    } else {
      messages.forEach(msg => {
        console.log(`[${msg.timestamp.toISOString()}] ${msg.userId} (${msg.sessionId})`);
        console.log(`${msg.isUserMessage ? 'USER' : 'BOT'}: ${msg.message}`);
        console.log('-----------------------------------');
      });
    }
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error fetching messages:', error);
    mongoose.connection.close();
  }
}

displayMessages();