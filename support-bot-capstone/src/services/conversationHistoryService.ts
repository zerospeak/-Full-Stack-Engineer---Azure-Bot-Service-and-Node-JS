import { Message } from '../models/message';

export class ConversationHistoryService {
    private readonly messageHistory: Map<string, Message[]>;
    
    constructor() {
        this.messageHistory = new Map<string, Message[]>();
    }
    
    public async saveMessage(message: Message): Promise<void> {
        try {
            if (!message.sessionId) {
                throw new Error('Session ID is required');
            }
            
            const sessionKey = `${message.userId}:${message.sessionId}`;
            const existingMessages = this.messageHistory.get(sessionKey) || [];
            
            existingMessages.push(message);
            this.messageHistory.set(sessionKey, existingMessages);
            
            console.log(`Message saved for session ${sessionKey}`);
        } catch (error) {
            console.error('Error saving message to history:', error);
            throw error;
        }
    }

    public async getConversationHistory(userId: string, sessionId: string): Promise<Message[]> {
        try {
            const sessionKey = `${userId}:${sessionId}`;
            return this.messageHistory.get(sessionKey) || [];
        } catch (error) {
            console.error('Error retrieving conversation history:', error);
            return [];
        }
    }
}