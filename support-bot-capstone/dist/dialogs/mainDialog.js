"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MainDialog = void 0;
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const knowledgeBaseService_1 = require("../services/knowledgeBaseService");
const conversationHistoryService_1 = require("../services/conversationHistoryService");
const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';
class MainDialog extends botbuilder_dialogs_1.ComponentDialog {
    constructor(nlpService) {
        super('MainDialog');
        this.nlpService = nlpService;
        this.kbService = new knowledgeBaseService_1.KnowledgeBaseService();
        this.historyService = new conversationHistoryService_1.ConversationHistoryService();
        this.addDialog(new botbuilder_dialogs_1.WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.processResponseStep.bind(this)
        ]));
        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }
    async run(turnContext, accessor) {
        try {
            const dialogSet = new botbuilder_dialogs_1.DialogSet(accessor);
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
            if (results && results.status === botbuilder_dialogs_1.DialogTurnStatus.empty) {
                await dialogContext.beginDialog(this.id);
            }
            // Save any state changes
            if (accessor && dialogContext.activeDialog) {
                await accessor.set(turnContext, dialogContext.activeDialog);
            }
        }
        catch (error) {
            console.error('Dialog error:', error);
            if (turnContext && turnContext.sendActivity) {
                try {
                    await turnContext.sendActivity({
                        type: 'message',
                        text: 'I encountered an error processing your request.'
                    });
                }
                catch (sendError) {
                    console.error('Error sending error message:', sendError);
                }
            }
        }
    }
    async initialStep(stepContext) {
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
        }
        catch (error) {
            console.error('Error in initialStep:', error);
            await stepContext.context.sendActivity('I encountered an error processing your message.');
            return await stepContext.next();
        }
    }
    async processResponseStep(stepContext) {
        return await stepContext.replaceDialog(this.initialDialogId);
    }
}
exports.MainDialog = MainDialog;
//# sourceMappingURL=mainDialog.js.map