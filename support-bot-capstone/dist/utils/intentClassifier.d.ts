interface TrainingItem {
    text: string;
    intent: string;
}
export declare class IntentClassifier {
    private classifier;
    private initialized;
    constructor();
    train(trainingData: TrainingItem[]): void;
    classify(text: string): string;
}
export {};
