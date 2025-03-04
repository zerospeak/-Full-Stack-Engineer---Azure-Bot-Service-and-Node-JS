# Define project root directory
$projectRoot = ".\support-bot-capstone"

# Create project directory structure
New-Item -ItemType Directory -Path $projectRoot -Force
Set-Location $projectRoot

# Create directory structure
$directories = @(
    "src",
    "src\bot",
    "src\dialogs",
    "src\models",
    "src\services",
    "src\utils",
    "src\middleware",
    "src\web",
    "src\web\public",
    "src\web\views",
    "config",
    "tests",
    "docker"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force
    Write-Host "Created directory: $dir"
}

# Create package.json
$packageJson = @"
{
  "name": "support-bot-capstone",
  "version": "1.0.0",
  "description": "Intelligent Customer Support Chatbot",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon --exec ts-node src/index.ts",
    "test": "jest",
    "lint": "eslint src/**/*.ts",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down"
  },
  "keywords": [
    "chatbot",
    "bot-framework",
    "customer-support",
    "nlp"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "botbuilder": "^4.19.0",
    "botbuilder-dialogs": "^4.19.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "redis": "^4.6.7",
    "natural": "^6.5.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/jest": "^29.5.3",
    "@types/node": "^20.4.5",
    "@typescript-eslint/eslint-plugin": "^6.2.0",
    "@typescript-eslint/parser": "^6.2.0",
    "eslint": "^8.46.0",
    "jest": "^29.6.2",
    "nodemon": "^3.0.1",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.6"
  }
}
"@
Set-Content -Path "package.json" -Value $packageJson

# Create tsconfig.json
$tsconfigJson = @"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
"@
Set-Content -Path "tsconfig.json" -Value $tsconfigJson

# Create .env file
$envContent = @"
# Environment Configuration
NODE_ENV=development
PORT=3978

# Bot Configuration
BOT_ID=SupportBot
MICROSOFT_APP_ID=
MICROSOFT_APP_PASSWORD=

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/supportbot
REDIS_URI=redis://localhost:6379
"@
Set-Content -Path ".env" -Value $envContent

# Create Docker Compose file
$dockerComposeContent = @"
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    ports:
      - "3978:3978"
    environment:
      - NODE_ENV=production
      - PORT=3978
      - MONGODB_URI=mongodb://mongodb:27017/supportbot
      - REDIS_URI=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./:/app
      - /app/node_modules

  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:latest
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongodb_data:
  redis_data:
"@
Set-Content -Path "docker-compose.yml" -Value $dockerComposeContent

# Create Dockerfile
$dockerfileContent = @"
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

EXPOSE 3978

CMD ["npm", "start"]
"@
New-Item -ItemType Directory -Path "docker" -Force
Set-Content -Path "docker/Dockerfile" -Value $dockerfileContent

# Create source files
$indexTs = @"
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as express from 'express';
import { BotFrameworkAdapter, ConversationState, MemoryStorage, UserState } from 'botbuilder';
import { SupportBot } from './bot/supportBot';
import { connectToDatabase } from './services/database';
import { connectToRedis } from './services/redis';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Create HTTP server
const app = express();
const PORT = process.env.PORT || 3978;

// Connect to databases
connectToDatabase();
connectToRedis();

// Create adapter
const adapter = new BotFrameworkAdapter({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Define storage and state
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);
const userState = new UserState(memoryStorage);

// Create the bot
const bot = new SupportBot(conversationState, userState);

// Error handler
adapter.onTurnError = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: \${error}`);
    await context.sendActivity('The bot encountered an error. Please try again later.');
    await conversationState.delete(context);
};

// Listen for incoming requests
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// Serve static files
app.use(express.static(path.join(__dirname, 'web/public')));

// Serve the bot interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'web/views/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port \${PORT}`);
});
"@
Set-Content -Path "src/index.ts" -Value $indexTs

$supportBotTs = @"
import { ActivityHandler, BotState, ConversationState, StatePropertyAccessor, UserState } from 'botbuilder';
import { MainDialog } from '../dialogs/mainDialog';
import { NLPService } from '../services/nlpService';

export class SupportBot extends ActivityHandler {
    private conversationState: BotState;
    private userState: BotState;
    private dialog: MainDialog;
    private dialogState: StatePropertyAccessor;
    private nlpService: NLPService;

    constructor(conversationState: ConversationState, userState: UserState) {
        super();
        this.conversationState = conversationState;
        this.userState = userState;
        this.dialogState = conversationState.createProperty('DialogState');
        this.nlpService = new NLPService();
        this.dialog = new MainDialog(this.nlpService);

        this.onMessage(async (context, next) => {
            console.log('Processing message activity');
            await this.dialog.run(context, this.dialogState);
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded || [];
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Welcome to the Customer Support Bot! How can I help you today?');
                }
            }
            await next();
        });
    }

    public async run(context) {
        await super.run(context);
        await this.conversationState.saveChanges(context);
        await this.userState.saveChanges(context);
    }
}
"@
Set-Content -Path "src/bot/supportBot.ts" -Value $supportBotTs

$mainDialogTs = @"
import { ComponentDialog, DialogSet, DialogTurnStatus, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { NLPService } from '../services/nlpService';
import { KnowledgeBaseService } from '../services/knowledgeBaseService';
import { ConversationHistoryService } from '../services/conversationHistoryService';

const MAIN_WATERFALL_DIALOG = 'mainWaterfallDialog';

export class MainDialog extends ComponentDialog {
    private nlpService: NLPService;
    private kbService: KnowledgeBaseService;
    private historyService: ConversationHistoryService;

    constructor(nlpService: NLPService) {
        super('MainDialog');
        
        this.nlpService = nlpService;
        this.kbService = new KnowledgeBaseService();
        this.historyService = new ConversationHistoryService();

        this.addDialog(new WaterfallDialog(MAIN_WATERFALL_DIALOG, [
            this.initialStep.bind(this),
            this.processResponseStep.bind(this)
        ]));

        this.initialDialogId = MAIN_WATERFALL_DIALOG;
    }

    async run(turnContext, accessor) {
        const dialogSet = new DialogSet(accessor);
        dialogSet.add(this);

        const dialogContext = await dialogSet.createContext(turnContext);
        const results = await dialogContext.continueDialog();
        
        if (results.status === DialogTurnStatus.empty) {
            await dialogContext.beginDialog(this.id);
        }
    }

    async initialStep(stepContext: WaterfallStepContext) {
        const userMessage = stepContext.context.activity.text;
        
        // Save conversation history
        await this.historyService.saveMessage({
            userId: stepContext.context.activity.from.id,
            sessionId: stepContext.context.activity.conversation.id,
            message: userMessage,
            timestamp: new Date(),
            isUserMessage: true
        });

        // Process message with NLP
        const intent = await this.nlpService.detectIntent(userMessage);
        const entities = await this.nlpService.extractEntities(userMessage);
        
        // Get response from knowledge base
        const response = await this.kbService.getResponse(intent, entities, userMessage);
        
        // Save bot response to history
        await this.historyService.saveMessage({
            userId: stepContext.context.activity.from.id,
            sessionId: stepContext.context.activity.conversation.id,
            message: response,
            timestamp: new Date(),
            isUserMessage: false
        });

        await stepContext.context.sendActivity(response);
        return await stepContext.next();
    }

    async processResponseStep(stepContext: WaterfallStepContext) {
        return await stepContext.replaceDialog(this.initialDialogId);
    }
}
"@
Set-Content -Path "src/dialogs/mainDialog.ts" -Value $mainDialogTs

$nlpServiceTs = @"
import * as natural from 'natural';
import { IntentClassifier } from '../utils/intentClassifier';
import { EntityExtractor } from '../utils/entityExtractor';

export class NLPService {
    private tokenizer: natural.WordTokenizer;
    private stemmer: natural.PorterStemmer;
    private classifier: IntentClassifier;
    private entityExtractor: EntityExtractor;

    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.stemmer = natural.PorterStemmer;
        this.classifier = new IntentClassifier();
        this.entityExtractor = new EntityExtractor();
        
        // Initialize with training data
        this.initializeClassifier();
    }

    private initializeClassifier(): void {
        // Training data for intent classification
        const trainingData = [
            { text: 'How do I reset my password', intent: 'password_reset' },
            { text: 'I forgot my password', intent: 'password_reset' },
            { text: 'Need to change password', intent: 'password_reset' },
            { text: 'How do I create an account', intent: 'account_creation' },
            { text: 'I want to register', intent: 'account_creation' },
            { text: 'Sign up process', intent: 'account_creation' },
            { text: 'Product features', intent: 'product_info' },
            { text: 'What can your product do', intent: 'product_info' },
            { text: 'Tell me about your services', intent: 'product_info' },
            { text: 'I have a problem with my order', intent: 'order_issue' },
            { text: 'My order hasn\'t arrived', intent: 'order_issue' },
            { text: 'Wrong item in my order', intent: 'order_issue' },
            { text: 'How do I contact support', intent: 'contact_support' },
            { text: 'I need to speak to a human', intent: 'contact_support' },
            { text: 'Connect me with an agent', intent: 'contact_support' }
        ];

        this.classifier.train(trainingData);
    }

    public async detectIntent(text: string): Promise<string> {
        return this.classifier.classify(text);
    }

    public async extractEntities(text: string): Promise<any> {
        return this.entityExtractor.extract(text);
    }

    public tokenize(text: string): string[] {
        return this.tokenizer.tokenize(text);
    }

    public stem(word: string): string {
        return this.stemmer.stem(word);
    }
}
"@
Set-Content -Path "src/services/nlpService.ts" -Value $nlpServiceTs

$knowledgeBaseServiceTs = @"
export class KnowledgeBaseService {
    private knowledgeBase: Map<string, string[]>;

    constructor() {
        this.knowledgeBase = new Map();
        this.initializeKnowledgeBase();
    }

    private initializeKnowledgeBase(): void {
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

        // Default fallback responses
        this.knowledgeBase.set('default', [
            'I\'m not sure I understand. Could you rephrase your question?',
            'I don\'t have information on that topic. Could you try asking something else?',
            'I\'m still learning and don\'t have an answer for that yet. Is there something else I can help with?'
        ]);
    }

    public async getResponse(intent: string, entities: any, query: string): Promise<string> {
        // Get appropriate responses based on intent
        const responses = this.knowledgeBase.get(intent) || this.knowledgeBase.get('default');
        
        // Select a random response from the available options
        const randomIndex = Math.floor(Math.random() * responses.length);
        return responses[randomIndex];
    }
}
"@
Set-Content -Path "src/services/knowledgeBaseService.ts" -Value $knowledgeBaseServiceTs
