import { ComponentDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { NLPService } from '../services/nlpService';
export declare class MainDialog extends ComponentDialog {
    private nlpService;
    private kbService;
    private historyService;
    constructor(nlpService: NLPService);
    run(turnContext: any, accessor: any): Promise<void>;
    initialStep(stepContext: WaterfallStepContext): Promise<import("botbuilder-dialogs").DialogTurnResult<any>>;
    processResponseStep(stepContext: WaterfallStepContext): Promise<import("botbuilder-dialogs").DialogTurnResult<any>>;
}
