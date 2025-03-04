import { KnowledgeBaseService } from '../../src/services/knowledgeBaseService';
import { describe, expect, test, beforeEach } from '@jest/globals';

describe('KnowledgeBaseService', () => {
    let kbService: KnowledgeBaseService;

    beforeEach(() => {
        kbService = new KnowledgeBaseService();
    });

    test('should return response for password reset intent', async () => {
        const response = await kbService.getResponse('password_reset');
        // Make the test case-insensitive
        expect(response.toLowerCase()).toContain('password');
    });

    test('should return default response for unknown intent', async () => {
        const response = await kbService.getResponse('unknown_intent');
        // Update to match one of the possible default responses
        expect(response).toMatch(/understand|don't have information|still learning/);
    });

    test('should return clarification for need_clarification intent', async () => {
        const response = await kbService.getResponse('need_clarification');
        // Update to match one of the possible clarification responses
        expect(response).toMatch(/details|more information|explain|specific/);
    });
    
    test('should return account creation response', async () => {
        const response = await kbService.getResponse('account_creation');
        expect(response.toLowerCase()).toContain('sign up');
    });
    
    test('should return product info response', async () => {
        const response = await kbService.getResponse('product_info');
        expect(response).toMatch(/features|analytics|platform|solution/i);
    });
    
    test('should return order issue response', async () => {
        const response = await kbService.getResponse('order_issue');
        expect(response.toLowerCase()).toContain('order');
    });
    
    test('should return contact support response', async () => {
        const response = await kbService.getResponse('contact_support');
        expect(response).toMatch(/support@example.com|1-800-123-4567/);
    });
    
    test('should return general help response', async () => {
        const response = await kbService.getResponse('general_help');
        expect(response).toMatch(/help|assist/i);
    });
    
    test('should handle empty intent', async () => {
        const response = await kbService.getResponse('');
        expect(response).toBeTruthy();
    });
});