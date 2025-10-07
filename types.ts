export interface Content {
  html: string;
}

export interface StudyGuide {
  algorithm: Content;
  vignettes: Content;
}

export type TabType = 'algorithm' | 'vignettes';