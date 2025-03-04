import * as path from 'path';
import * as dotenv from 'dotenv';
import express from 'express';
import { ConversationState, MemoryStorage, UserState } from 'botbuilder';
import { SupportBot } from './bot/supportBot';

// Load environment variables
dotenv.config();

// Create server with fallback ports
const PORT = process.env.PORT || 3978;
let currentPort = Number(PORT);
const app = express();

// Add body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define storage and state
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the bot with required state parameters
const bot = new SupportBot(conversationState, userState);

// Listen for incoming requests
app.post('/api/messages', async (req, res) => {
    try {
        const userMessage = req.body.text;
        if (!userMessage) {
            return res.status(400).json({ text: 'Message is required' });
        }

        // Process the message and get a response
        const response = await bot.processUserMessage(userMessage);
        return res.json({ text: response });
    } catch (error) {
        console.error('Error processing message:', error);
        return res.status(500).json({ text: 'An error occurred processing your message' });
    }
});

// Serve static files
app.use(express.static(path.resolve(__dirname, '../web/public')));

// Serve the bot interface
app.get('/', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../web/views/index.html'));
});

// Start the server
const startServer = (): void => {
    const server = app.listen(currentPort, () => {
        console.log(`Server running on port ${currentPort}`);
    }).on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${currentPort} is busy, trying port ${currentPort + 1}`);
            currentPort++;
            server.close();
            startServer();
        } else {
            console.error('Server error:', err);
        }
    });
};

startServer();
