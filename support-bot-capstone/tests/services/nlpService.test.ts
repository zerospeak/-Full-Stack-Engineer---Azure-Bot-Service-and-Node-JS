import { NLPService } from '../../src/services/nlpService';

describe('NLPService', () => {
    let nlpService: NLPService;

    beforeEach(() => {
        nlpService = new NLPService();
    });

    test('should detect password reset intent', async () => {
        const result = await nlpService.detectIntent('How do I reset my password?');
        expect(result).toBe('password_reset');
    });

    test('should detect account creation intent', async () => {
        const result = await nlpService.detectIntent('I want to create an account');
        expect(result).toBe('account_creation');
    });

    test('should return need_clarification for short messages', async () => {
        const result = await nlpService.detectIntent('hi');
        expect(result).toBe('need_clarification');
    });

    test('should return need_clarification for empty messages', async () => {
        const result = await nlpService.detectIntent('');
        expect(result).toBe('need_clarification');
    });
});