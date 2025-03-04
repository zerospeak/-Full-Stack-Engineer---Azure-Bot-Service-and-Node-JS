import { ConversationHistoryService } from '../../src/services/conversationHistoryService';
import { Message } from '../../src/models/message';
import { describe, expect, test, beforeEach } from '@jest/globals';

describe('ConversationHistoryService', () => {
    let historyService: ConversationHistoryService;

    beforeEach(() => {
        historyService = new ConversationHistoryService();
    });

    test('should save and retrieve messages', async () => {
        const message: Message = {
            userId: 'user1',
            sessionId: 'session1',
            message: 'test message',
            timestamp: new Date(),
            isUserMessage: true
        };

        await historyService.saveMessage(message);
        const history = await historyService.getConversationHistory('user1', 'session1');
        
        expect(history).toHaveLength(1);
        expect(history[0].message).toBe('test message');
    });

    test('should throw error for missing sessionId', async () => {
        const message: Message = {
            userId: 'user1',
            sessionId: '',
            message: 'test',
            timestamp: new Date(),
            isUserMessage: true
        };

        await expect(historyService.saveMessage(message)).rejects.toThrow('Session ID is required');
    });
});