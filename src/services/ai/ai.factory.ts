import { env } from '../../config/env.js';
import { IAiService } from './ai.interface.js';
import { MockDeterministicAiService } from './mockDeterministicAi.service.js';
import { OpenAiService } from './openai.service.js';
import { GeminiService } from './gemini.service.js';
import { NvidiaService } from './nvidia.service.js';
import { logger } from '../../config/logger.js';

let aiInstance: IAiService | null = null;

export function getAiService(): IAiService {
  if (aiInstance) return aiInstance;

  switch (env.AI_PROVIDER) {
    case 'nvidia':
      logger.info('Initializing NVIDIA Accelerated AI Service provider');
      aiInstance = new NvidiaService();
      break;
    case 'openai':
      logger.info('Initializing OpenAI AI Service provider');
      aiInstance = new OpenAiService();
      break;
    case 'gemini':
      logger.info('Initializing Google Gemini AI Service provider');
      aiInstance = new GeminiService();
      break;
    case 'mock':
    default:
      logger.info('Initializing Mock Deterministic AI Service provider');
      aiInstance = new MockDeterministicAiService();
      break;
  }

  return aiInstance;
}
