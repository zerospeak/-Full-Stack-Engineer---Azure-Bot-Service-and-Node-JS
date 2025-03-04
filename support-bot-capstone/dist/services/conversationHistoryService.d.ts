import { Message } from '../models/message';
export declare class ConversationHistoryService {
    private readonly messageHistory;
    constructor();
    saveMessage(message: Message): Promise<void>;
    getConversationHistory(userId: string, sessionId: string): Promise<Message[]>;
}
