import * as mongoose from 'mongoose';

export interface Message {
  userId: string;
  sessionId: string;
  message: string;
  timestamp: Date;
  isUserMessage: boolean;
}

const messageSchema = new mongoose.Schema<Message>({
  userId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  isUserMessage: { type: Boolean, required: true }
});

export const MessageModel = mongoose.model<Message>('Message', messageSchema);