"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationHistoryService = void 0;
class ConversationHistoryService {
    constructor() {
        this.messageHistory = new Map();
    }
    async saveMessage(message) {
        try {
            if (!message.sessionId) {
                throw new Error('Session ID is required');
            }
            const sessionKey = `${message.userId}:${message.sessionId}`;
            const existingMessages = this.messageHistory.get(sessionKey) || [];
            existingMessages.push(message);
            this.messageHistory.set(sessionKey, existingMessages);
            console.log(`Message saved for session ${sessionKey}`);
        }
        catch (error) {
            console.error('Error saving message to history:', error);
            throw error;
        }
    }
    async getConversationHistory(userId, sessionId) {
        try {
            const sessionKey = `${userId}:${sessionId}`;
            return this.messageHistory.get(sessionKey) || [];
        }
        catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }
}
exports.ConversationHistoryService = ConversationHistoryService;
//# sourceMappingURL=conversationHistoryService.js.map