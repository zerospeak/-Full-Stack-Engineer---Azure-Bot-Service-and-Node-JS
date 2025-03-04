export declare class KnowledgeBaseService {
    private readonly knowledgeBase;
    constructor();
    private initializeKnowledgeBase;
    getResponse(intent: string): Promise<string>;
}
