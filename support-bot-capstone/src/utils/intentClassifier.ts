import * as natural from 'natural';

interface TrainingItem {
    text: string;
    intent: string;
}

export class IntentClassifier {
    private classifier: natural.BayesClassifier;
    private initialized: boolean = false;

    constructor() {
        this.classifier = new natural.BayesClassifier();
    }

    public train(trainingData: TrainingItem[]): void {
        if (this.initialized) {
            return;
        }

        // Add training data to classifier
        for (const item of trainingData) {
            this.classifier.addDocument(item.text.toLowerCase(), item.intent);
        }

        // Train the classifier
        this.classifier.train();
        this.initialized = true;
        console.log('Intent classifier trained successfully');
    }

    public classify(text: string): string {
        if (!this.initialized) {
            console.error('Classifier not trained');
            return 'default';
        }

        try {
            // Normalize input text
            const normalizedText = text.toLowerCase().trim();
            
            // Get classification result
            const result = this.classifier.classify(normalizedText);
            console.log(`Classified "${text}" as "${result}"`);
            return result;
        } catch (error) {
            console.error('Error classifying text:', error);
            return 'default';
        }
    }
}