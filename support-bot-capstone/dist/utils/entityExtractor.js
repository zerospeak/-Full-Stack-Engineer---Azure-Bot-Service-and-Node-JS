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
exports.EntityExtractor = void 0;
const natural = __importStar(require("natural"));
class EntityExtractor {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
    }
    extract(text) {
        // This is a simplified entity extraction
        // In a real application, you would use more sophisticated techniques
        const tokens = this.tokenizer.tokenize(text) || [];
        const entities = {
            // Extract potential order numbers (e.g., #12345 or ORDER-12345)
            orderNumber: tokens.find(token => /^#\d+$/.test(token) || /^ORDER-\d+$/i.test(token)),
            // Extract potential product names (simplified)
            productName: tokens.find(token => token.length > 3 && /^[A-Z]/.test(token)),
            // Extract potential dates (very simplified)
            date: tokens.find(token => /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(token))
        };
        return entities;
    }
}
exports.EntityExtractor = EntityExtractor;
//# sourceMappingURL=entityExtractor.js.map