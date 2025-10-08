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

export interface CachedResult {
  topic: string;
  algorithm: Content;
}
