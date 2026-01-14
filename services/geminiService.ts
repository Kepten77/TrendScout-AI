
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, Timeframe, ViralContent, ContentAnalysis, GeneratedContent } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const searchTrends = async (topic: string, platforms: Platform[], timeframe: Timeframe): Promise<ViralContent[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Найди 5 трендовых постов/роликов на платформах ${platforms.join(', ')} по теме "${topic}" за последний период: ${timeframe === 'day' ? 'день' : 'неделя'}. 
    Для Pinterest найди топовые пины. Для Threads - виральные ветки.
    Верни ответ строго в формате JSON. Все текстовые поля (title, summary, transcript) должны быть на РУССКОМ языке.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            platform: { type: Type.STRING },
            author: { type: Type.STRING },
            views: { type: Type.STRING },
            likes: { type: Type.STRING },
            comments: { type: Type.STRING },
            shares: { type: Type.STRING },
            saves: { type: Type.STRING },
            thumbnail: { type: Type.STRING, description: 'URL изображения-заглушки из picsum' },
            summary: { type: Type.STRING },
            transcript: { type: Type.STRING, description: 'Детальный текст ролика или содержание поста/пина на русском' }
          },
          required: ['id', 'title', 'platform', 'views', 'transcript']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse search trends", e);
    return [];
  }
};

export const getChannelTrends = async (channelUrl: string): Promise<ViralContent[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Изучи канал/аккаунт по этой ссылке: ${channelUrl}. Найди 5 самых популярных или последних успешных публикаций. 
    Верни результат на РУССКОМ языке в формате JSON.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            platform: { type: Type.STRING },
            author: { type: Type.STRING },
            views: { type: Type.STRING },
            likes: { type: Type.STRING },
            comments: { type: Type.STRING },
            shares: { type: Type.STRING },
            saves: { type: Type.STRING },
            thumbnail: { type: Type.STRING },
            summary: { type: Type.STRING },
            transcript: { type: Type.STRING }
          },
          required: ['id', 'title', 'platform', 'views', 'transcript']
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Failed to parse channel trends", e);
    return [];
  }
};

export const analyzeSpecificUrl = async (url: string): Promise<{ content: ViralContent; analysis: ContentAnalysis }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Проанализируй конкретный пост/ролик/пин по ссылке: ${url}. 
    1. Извлеки метаданные.
    2. Извлеки/восстанови полный текст/сценарий.
    3. Глубоко проанализируй идею, смыслы, триггеры, структуру, подачу и эмоции.
    Все ответы должны быть на РУССКОМ языке.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          content: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              author: { type: Type.STRING },
              views: { type: Type.STRING },
              likes: { type: Type.STRING },
              comments: { type: Type.STRING },
              shares: { type: Type.STRING },
              saves: { type: Type.STRING },
              thumbnail: { type: Type.STRING },
              summary: { type: Type.STRING },
              transcript: { type: Type.STRING }
            },
            required: ['title', 'platform', 'transcript']
          },
          analysis: {
            type: Type.OBJECT,
            properties: {
              coreIdea: { type: Type.STRING },
              meaning: { type: Type.STRING },
              triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
              structure: { type: Type.ARRAY, items: { type: Type.STRING } },
              tone: { type: Type.STRING },
              emotion: { type: Type.STRING },
              fullTranscript: { type: Type.STRING }
            },
            required: ['coreIdea', 'triggers', 'structure']
          }
        },
        required: ['content', 'analysis']
      }
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Failed to parse specific URL analysis", e);
    throw e;
  }
};

export const analyzeContent = async (content: ViralContent): Promise<ContentAnalysis> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Проанализируй этот текст/транскрипт вирального контента:
    Название: ${content.title}
    Текст: ${content.transcript}
    Кратко: ${content.summary}
    Выдели смыслы, психологические триггеры, структуру и эмоции на РУССКОМ языке.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          coreIdea: { type: Type.STRING },
          meaning: { type: Type.STRING },
          triggers: { type: Type.ARRAY, items: { type: Type.STRING } },
          structure: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone: { type: Type.STRING },
          emotion: { type: Type.STRING },
          fullTranscript: { type: Type.STRING }
        },
        required: ['coreIdea', 'triggers', 'structure', 'emotion']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateNewContent = async (analysis: ContentAnalysis, format: 'script' | 'carousel'): Promise<GeneratedContent> => {
  const prompt = format === 'script' 
    ? `Создай готовый виральный СЦЕНАРИЙ для видео на основе этих данных: ${JSON.stringify(analysis)}. Сделай его уникальным, сохранив психологическую структуру. Язык: РУССКИЙ.`
    : `Создай план для ФОТО-КАРУСЕЛИ из 7 слайдов на основе этих данных: ${JSON.stringify(analysis)}. Опиши текст и визуал для каждого слайда. Язык: РУССКИЙ.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          type: { type: Type.STRING },
          title: { type: Type.STRING },
          content: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'content', 'hashtags']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
