
export type Platform = 'instagram' | 'tiktok' | 'youtube' | 'threads' | 'pinterest';
export type Timeframe = 'day' | 'week';

export interface ViralContent {
  id: string;
  title: string;
  platform: Platform;
  author: string;
  views: string;
  likes: string;
  comments: string;
  shares: string;
  saves?: string;
  thumbnail: string;
  summary: string;
  transcript: string;
}

export interface ContentAnalysis {
  coreIdea: string;
  meaning: string;
  triggers: string[];
  structure: string[];
  tone: string;
  emotion: string;
  fullTranscript: string;
}

export interface GeneratedContent {
  type: 'script' | 'carousel';
  title: string;
  content: string[]; // Steps for script or slides for carousel
  hashtags: string[];
}
