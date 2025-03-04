"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntentClassifier = void 0;
const natural = __importStar(require("natural"));
class IntentClassifier {
    constructor() {
        this.initialized = false;
        this.classifier = new natural.BayesClassifier();
    }
    train(trainingData) {
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
    classify(text) {
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
        }
        catch (error) {
            console.error('Error classifying text:', error);
            return 'default';
        }
    }
}
exports.IntentClassifier = IntentClassifier;
//# sourceMappingURL=intentClassifier.js.map