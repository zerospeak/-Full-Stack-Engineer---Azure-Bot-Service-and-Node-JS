// Remove the unused import
// import * as natural from 'natural';
import { IntentClassifier } from '../utils/intentClassifier';

export class NLPService {
    private classifier: IntentClassifier;

    constructor() {
        this.classifier = new IntentClassifier();
        this.initializeTrainingData();
    }

    private initializeTrainingData(): void {
        const trainingData = [
            // Password reset examples
            { text: 'How do I reset my password', intent: 'password_reset' },
            { text: 'I forgot my password', intent: 'password_reset' },
            { text: 'Need to change password', intent: 'password_reset' },
            { text: 'Can\'t remember my password', intent: 'password_reset' },
            { text: 'Lost password', intent: 'password_reset' },
            { text: 'Password reset', intent: 'password_reset' },
            { text: 'Change my password', intent: 'password_reset' },
            
            // Account creation examples
            { text: 'How do I create an account', intent: 'account_creation' },
            { text: 'I want to register', intent: 'account_creation' },
            { text: 'Sign up process', intent: 'account_creation' },
            { text: 'Create new account', intent: 'account_creation' },
            { text: 'How to sign up', intent: 'account_creation' },
            
            // Product info examples
            { text: 'Product features', intent: 'product_info' },
            { text: 'What can your product do', intent: 'product_info' },
            { text: 'Tell me about your services', intent: 'product_info' },
            { text: 'What features do you offer', intent: 'product_info' },
            { text: 'Product information', intent: 'product_info' },
            
            // Order issue examples
            { text: 'I have a problem with my order', intent: 'order_issue' },
            { text: 'My order hasn\'t arrived', intent: 'order_issue' },
            { text: 'Wrong item in my order', intent: 'order_issue' },
            { text: 'Order status', intent: 'order_issue' },
            { text: 'Where is my order', intent: 'order_issue' },
            
            // Contact support examples
            { text: 'How do I contact support', intent: 'contact_support' },
            { text: 'I need to speak to a human', intent: 'contact_support' },
            { text: 'Connect me with an agent', intent: 'contact_support' },
            { text: 'Customer service contact', intent: 'contact_support' },
            { text: 'Support phone number', intent: 'contact_support' },
            // Add general help intent
            { text: 'help', intent: 'general_help' },
            { text: 'HELP', intent: 'general_help' },
            { text: 'I need help', intent: 'general_help' },
            { text: 'Can you help me', intent: 'general_help' },
            { text: 'assistance', intent: 'general_help' },
            
            // Add clarification intent
            { text: 'I have a question', intent: 'need_clarification' },
            { text: 'question', intent: 'need_clarification' },
            { text: 'query', intent: 'need_clarification' },
            { text: 'ask', intent: 'need_clarification' },
            
        ];

        this.classifier.train(trainingData);
    }

    public async detectIntent(text: string): Promise<string> {
        if (!text || text.length < 3 || /^\W+$/.test(text)) {
            return 'need_clarification';
        }

        return this.classifier.classify(text);
    }
}
