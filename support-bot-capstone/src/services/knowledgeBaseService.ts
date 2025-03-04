export class KnowledgeBaseService {
    private readonly knowledgeBase: Map<string, string[]>;
    
    constructor() {
        this.knowledgeBase = new Map<string, string[]>();
        this.initializeKnowledgeBase();
    }
    
    private initializeKnowledgeBase(): void {
        // Add clarification responses
        this.knowledgeBase.set('need_clarification', [
            'Could you please provide more details about your question?',
            'I need more information to help you better. Could you explain further?',
            'I\'m not sure what you\'re asking. Could you write a complete sentence?',
            'To help you better, I need you to be more specific. What exactly would you like to know?'
        ]);

        // Populate knowledge base with responses for different intents
        this.knowledgeBase.set('password_reset', [
            'To reset your password, go to the login page and click on "Forgot Password". Follow the instructions sent to your email.',
            'You can reset your password through the "Forgot Password" link on the login screen. You\'ll receive an email with instructions.',
            'Password reset is simple: click "Forgot Password" on the login page and follow the email instructions you\'ll receive.'
        ]);

        this.knowledgeBase.set('account_creation', [
            'To create a new account, click on the "Sign Up" button on our homepage and fill out the registration form.',
            'Creating an account is easy! Just click "Sign Up" and complete the registration process with your details.',
            'You can register by clicking the "Sign Up" button and providing the required information in the registration form.'
        ]);

        this.knowledgeBase.set('product_info', [
            'Our product offers advanced analytics, real-time monitoring, and customizable dashboards to help you make data-driven decisions.',
            'We provide a comprehensive solution with features including data visualization, automated reporting, and predictive analytics.',
            'Our platform includes features like user management, role-based access control, and integration with popular third-party services.'
        ]);

        this.knowledgeBase.set('order_issue', [
            'I\'m sorry to hear about your order issue. Please provide your order number, and I can check the status for you.',
            'To help with your order problem, I\'ll need your order number and details about the issue you\'re experiencing.',
            'I apologize for the inconvenience with your order. Could you share your order number and describe the problem in detail?'
        ]);

        this.knowledgeBase.set('contact_support', [
            'You can contact our support team via email at support@example.com or by phone at 1-800-123-4567 during business hours.',
            'Our support team is available Monday through Friday, 9 AM to 6 PM EST. You can reach them at support@example.com.',
            'For immediate assistance, please call our support line at 1-800-123-4567 or send an email to support@example.com.'
        ]);

        // Add general help responses
        this.knowledgeBase.set('general_help', [
            'I can help you with password resets, account creation, product information, order issues, or connecting you with support. What do you need help with?',
            'I\'m here to assist you! I can help with account issues, product information, orders, or connecting you with our support team. What can I help you with today?',
            'How can I assist you today? I can help with passwords, accounts, product details, orders, or connecting you with our support team.'
        ]);

        // Default fallback responses
        this.knowledgeBase.set('default', [
            'I\'m not sure I understand. Could you rephrase your question?',
            'I don\'t have information on that topic. Could you try asking something else?',
            'I\'m still learning and don\'t have an answer for that yet. Is there something else I can help with?'
        ]);
    }

    public async getResponse(intent: string): Promise<string> {
        const safeIntent = intent || 'default';
        const responses = this.knowledgeBase.get(safeIntent) || this.knowledgeBase.get('default');
        
        if (!responses || responses.length === 0) {
            return "I'm sorry, I don't have a response for that.";
        }
        
        // Select a random response from the available options
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
}
