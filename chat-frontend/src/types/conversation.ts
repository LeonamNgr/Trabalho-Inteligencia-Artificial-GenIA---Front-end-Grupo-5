<<<<<<< HEAD
import type { Message } from './message';

export interface Conversation {
  id: number;
  title?: string;
}

export interface ConversationSummary {
  id: number;
=======
export interface Conversation {
  id: string;
>>>>>>> 4df804c529dd6aa90a9fe0970b1be1d05e0f43b1
  title: string;
  lastMessage: string;
  updatedAt: string;
}
