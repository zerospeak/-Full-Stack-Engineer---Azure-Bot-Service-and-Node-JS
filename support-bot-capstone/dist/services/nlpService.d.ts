export declare class NLPService {
    private classifier;
    constructor();
    private initializeTrainingData;
    detectIntent(text: string): Promise<string>;
}
