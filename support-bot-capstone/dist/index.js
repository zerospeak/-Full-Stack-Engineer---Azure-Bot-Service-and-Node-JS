"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const express_1 = __importDefault(require("express"));
const botbuilder_1 = require("botbuilder");
const supportBot_1 = require("./bot/supportBot");
// Load environment variables
dotenv.config();
// Create server with fallback ports
const PORT = process.env.PORT || 3978;
let currentPort = Number(PORT);
const app = (0, express_1.default)();
// Add body parsing middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Define storage and state
const memoryStorage = new botbuilder_1.MemoryStorage();
const conversationState = new botbuilder_1.ConversationState(memoryStorage);
const userState = new botbuilder_1.UserState(memoryStorage);
// Create the bot with required state parameters
const bot = new supportBot_1.SupportBot(conversationState, userState);
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
    }
    catch (error) {
        console.error('Error processing message:', error);
        return res.status(500).json({ text: 'An error occurred processing your message' });
    }
});
// Serve static files
app.use(express_1.default.static(path.resolve(__dirname, '../web/public')));
// Serve the bot interface
app.get('/', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../web/views/index.html'));
});
// Start the server
const startServer = () => {
    const server = app.listen(currentPort, () => {
        console.log(`Server running on port ${currentPort}`);
    }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${currentPort} is busy, trying port ${currentPort + 1}`);
            currentPort++;
            server.close();
            startServer();
        }
        else {
            console.error('Server error:', err);
        }
    });
};
startServer();
//# sourceMappingURL=index.js.map