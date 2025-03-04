import { ActivityHandler, TurnContext, ConversationState, UserState } from 'botbuilder';
import { NLPService } from '../services/nlpService';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { ConversationHistoryService } from '../services/conversationHistoryService';
import { Message } from '../models/message';

export class SupportBot extends ActivityHandler {
    private readonly nlpService: NLPService;
    private readonly kbService: KnowledgeBaseService;
    private readonly historyService: ConversationHistoryService;
    private readonly conversationState: ConversationState;
    private readonly userState: UserState;

    constructor(conversationState: ConversationState, userState: UserState) {
        super();
        
        this.conversationState = conversationState;
        this.userState = userState;
        this.nlpService = new NLPService();
        this.kbService = new KnowledgeBaseService();
        this.historyService = new ConversationHistoryService();

        this.onMessage(async (context, next) => {
            try {
                // Ensure serviceUrl is set
                if (!context.activity.serviceUrl) {
                    context.activity.serviceUrl = `http://localhost:${process.env.PORT || 3978}`;
                }

                await this.processMessage(context);
                
                // Save state changes
                await this.conversationState.saveChanges(context);
                await this.userState.saveChanges(context);
            } catch (error) {
                console.error('Error in onMessage:', error);
                await this.sendErrorMessage(context);
            } finally {
                await next();
            }
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded || [];
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to the Customer Support Bot! How can I help you today?');
                }
            }
            await next();
        });
    }

    private async processMessage(context: TurnContext): Promise<void> {
        if (!context || !context.activity) {
            throw new Error('Invalid context or activity');
        }

        const userMessage = context.activity.text || '';
        
        // Process message
        const intent = await this.nlpService.detectIntent(userMessage);
        const response = await this.kbService.getResponse(intent);
        
        // Send response with activity properties
        await context.sendActivity({
            type: 'message',
            text: response,
            serviceUrl: context.activity.serviceUrl,
            channelId: context.activity.channelId,
            conversation: context.activity.conversation,
            from: { id: 'bot', name: 'Support Bot' },
            recipient: context.activity.from
        });

        // Save messages to history
        if (context.activity.from && context.activity.conversation) {
            try {
                await this.saveMessageToHistory(
                    context.activity.from.id,
                    context.activity.conversation.id,
                    userMessage,
                    true
                );

                await this.saveMessageToHistory(
                    'bot',
                    context.activity.conversation.id,
                    response,
                    false
                );
            } catch (historyError) {
                console.error('Error saving to conversation history:', historyError);
            }
        }
    }

    private async saveMessageToHistory(
        userId: string, 
        sessionId: string, 
        message: string, 
        isUserMessage: boolean
    ): Promise<void> {
        const messageObj: Message = {
            userId,
            sessionId,
            message,
            timestamp: new Date(),
            isUserMessage
        };
        
        await this.historyService.saveMessage(messageObj);
    }
    private async sendErrorMessage(context: TurnContext): Promise<void> {
        try {
            await context.sendActivity({
                type: 'message',
                text: 'I encountered an error processing your request. Please try again.',
                serviceUrl: context.activity.serviceUrl,
                channelId: context.activity.channelId,
                conversation: context.activity.conversation,
                from: { id: 'bot', name: 'Support Bot' },
                recipient: context.activity.from
            });
        } catch (error) {
            console.error('Error sending error message:', error);
        }
    }

    public async processUserMessage(message: string): Promise<string> {
        if (!message) {
            return 'I didn\'t receive any message to process.';
        }
        
        try {
            // Process message with NLP
            const intent = await this.nlpService.detectIntent(message);
            const response = await this.kbService.getResponse(intent);
            
            // Save to history
            try {
                await this.saveMessageToHistory('user', 'direct-api', message, true);
                await this.saveMessageToHistory('bot', 'direct-api', response, false);
            } catch (historyError) {
                console.error('Error saving to conversation history:', historyError);
            }
            
            return response;
        } catch (error) {
            console.error('Error processing direct message:', error);
            return 'Sorry, I encountered an error processing your request.';
        }
    }

    public async run(context: TurnContext): Promise<void> {
        if (!context) {
            console.error('Invalid context passed to run method');
            return;
        }
        
        try {
            await super.run(context);
        } catch (error) {
            console.error('Error in bot.run:', error);
        }
    }
}
