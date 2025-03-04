import * as mongoose from 'mongoose';
export interface Message {
    userId: string;
    sessionId: string;
    message: string;
    timestamp: Date;
    isUserMessage: boolean;
}
export declare const MessageModel: mongoose.Model<Message, {}, {}, {}, mongoose.Document<unknown, {}, Message> & Message & {
    _id: mongoose.Types.ObjectId;
}, any>;
