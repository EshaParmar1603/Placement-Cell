import { logger } from '../../config/logger.js';

export type JobHandler<T = any> = (data: T) => Promise<void>;

interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  retries: number;
  maxRetries: number;
}

export class JobQueueService {
  private handlers = new Map<string, JobHandler>();
  private queue: Job[] = [];
  private isProcessing = false;

  registerHandler<T>(name: string, handler: JobHandler<T>) {
    this.handlers.set(name, handler);
  }

  enqueue<T>(name: string, data: T, maxRetries = 3): string {
    const jobId = Math.random().toString(36).substring(7);
    this.queue.push({
      id: jobId,
      name,
      data,
      retries: 0,
      maxRetries,
    });
    logger.info(`[Queue] Enqueued job '${name}' [ID: ${jobId}]`);
    this.processNext();
    return jobId;
  }

  private async processNext() {
    if (this.isProcessing || this.queue.length === 0) return;
    this.isProcessing = true;

    const job = this.queue.shift();
    if (!job) {
      this.isProcessing = false;
      return;
    }

    const handler = this.handlers.get(job.name);
    if (!handler) {
      logger.error(`[Queue] No handler registered for job '${job.name}'`);
      this.isProcessing = false;
      this.processNext();
      return;
    }

    try {
      logger.info(`[Queue] Processing job '${job.name}' [ID: ${job.id}]`);
      await handler(job.data);
      logger.info(`[Queue] Job '${job.name}' [ID: ${job.id}] completed successfully.`);
    } catch (error) {
      logger.error(`[Queue] Error processing job '${job.name}' [ID: ${job.id}]:`, error);
      if (job.retries < job.maxRetries) {
        job.retries++;
        logger.info(`[Queue] Retrying job '${job.name}' (Attempt ${job.retries}/${job.maxRetries})...`);
        this.queue.push(job);
      } else {
        logger.error(`[Queue] Job '${job.name}' [ID: ${job.id}] permanently failed after ${job.maxRetries} retries.`);
      }
    } finally {
      this.isProcessing = false;
      setImmediate(() => this.processNext());
    }
  }
}

export const jobQueue = new JobQueueService();
