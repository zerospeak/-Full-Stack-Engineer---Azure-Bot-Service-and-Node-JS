import { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { NLPService } from '../services/nlpService';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { ConversationHistoryService } from '../services/conversationHistoryService';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

export class MainDialog extends ComponentDialog {
    private nlpService: NLPService;
    private kbService: KnowledgeBaseService;
    private historyService: ConversationHistoryService;

    constructor(nlpService: NLPService) {
        super('MainDialog');
        
        this.nlpService = nlpService;
        this.kbService = new KnowledgeBaseService();
        this.historyService = new ConversationHistoryService();

        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.processResponseStep.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        try {
            const dialogSet = new DialogSet(accessor);
            dialogSet.add(this);

            // Check if turnContext is valid
            if (!turnContext || !turnContext.activity) {
                console.error('Invalid turn context');
                return;
            }
            
            const dialogContext = await dialogSet.createContext(turnContext);
            if (!dialogContext) {
                throw new Error('Failed to create dialog context');
            }
            
            const results = await dialogContext.continueDialog();
            if (results && results.status === DialogTurnStatus.empty) {
                await dialogContext.beginDialog(this.id);
            }
            
            // Save any state changes
            if (accessor && dialogContext.activeDialog) {
                await accessor.set(turnContext, dialogContext.activeDialog);
            }
            
        } catch (error) {
            console.error('Dialog error:', error);
            if (turnContext && turnContext.sendActivity) {
                try {
                    await turnContext.sendActivity({
                        type: 'message',
                        text: 'I encountered an error processing your request.'
                    });
                } catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        }
    }

    async initialStep(stepContext: WaterfallStepContext) {
        try {
            const userMessage = stepContext.context.activity.text || '';
            
            // Save conversation history
            if (stepContext.context.activity.from && stepContext.context.activity.conversation) {
                await this.historyService.saveMessage({
                    userId: stepContext.context.activity.from.id,
                    sessionId: stepContext.context.activity.conversation.id,
                    message: userMessage,
                    timestamp: new Date(),
                    isUserMessage: true
                });
            }
            
            // Process message with NLP and get response
            const intent = await this.nlpService.detectIntent(userMessage);
            const response = await this.kbService.getResponse(intent);
            
            // Save bot response to history
            if (stepContext.context.activity.from && stepContext.context.activity.conversation) {
                await this.historyService.saveMessage({
                    userId: stepContext.context.activity.from.id,
                    sessionId: stepContext.context.activity.conversation.id,
                    message: response,
                    timestamp: new Date(),
                    isUserMessage: false
                });
            }
            
            await stepContext.context.sendActivity(response);
            return await stepContext.next();
        } catch (error) {
            console.error('Error in initialStep:', error);
            await stepContext.context.sendActivity('I encountered an error processing your message.');
            return await stepContext.next();
        }
    }

    async processResponseStep(stepContext: WaterfallStepContext) {
        return await stepContext.replaceDialog(this.initialDialogId);
    }
}
