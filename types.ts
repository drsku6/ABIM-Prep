export interface Content {
  html: string;
}

export interface StudyGuide {
  algorithm: Content;
  vignettes: Content;
}

export type TabType = 'algorithm' | 'vignettes';

export interface ChatMessage {
  role: 'user' | 'model';
  html: string;
}

export interface Session {
  id: string;
  title: string;
  topic: string;
  algorithm: Content | null;
  vignettes: Content | null;
  chatHistory: ChatMessage[];
}
