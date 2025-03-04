import { ActivityHandler, TurnContext, ConversationState, UserState } from 'botbuilder';
export declare class SupportBot extends ActivityHandler {
    private readonly nlpService;
    private readonly kbService;
    private readonly historyService;
    private readonly conversationState;
    private readonly userState;
    constructor(conversationState: ConversationState, userState: UserState);
    private processMessage;
    private saveMessageToHistory;
    private sendErrorMessage;
    processUserMessage(message: string): Promise<string>;
    run(context: TurnContext): Promise<void>;
}
