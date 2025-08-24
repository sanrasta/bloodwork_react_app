import OpenAI from 'openai';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BloodworkResult, TestResult } from '../common/entities/bloodwork-result.entity';
import { InsightOut, TestResultInput } from './ai.types';
import { InsightOutArraySchema } from './ai.schema';
import { SYSTEM_PROMPT, BATCH_USER_TEMPLATE } from './ai.prompt';
import { getDefaultNote } from './getDefaultNote';

const PROMPT_VERSION = 'p1';

@Injectable()
export class AiRecommendationsService {
  private readonly log = new Logger(AiRecommendationsService.name);
  private readonly client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  private readonly model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

  constructor(
    @InjectRepository(BloodworkResult)
    private bloodworkRepository: Repository<BloodworkResult>,
  ) {}

  async generateAndPersistForAnalysis(analysisId: string): Promise<void> {
    // 1) Load the BloodworkResult row that contains the JSON "results" array
    const row = await this.bloodworkRepository.findOne({ 
      where: { jobId: analysisId } 
    }) as unknown as BloodworkResult | null;

    if (!row || !Array.isArray(row.results) || row.results.length === 0) {
      this.log.warn(`No results found for analysis ${analysisId}`);
      return;
    }

    // 2) Build batch inputs for the model
    const inputs: TestResultInput[] = row.results.map((r) => ({
      id: r.id,
      testName: r.testName,
      value: r.value,
      unit: r.unit,
      referenceRange: r.referenceRange,
      status: r.status as any,
    }));

    // 3) Auto-chunk >20 items
    const CHUNK = 20;
    const batches: TestResultInput[][] = [];
    for (let i = 0; i < inputs.length; i += CHUNK) {
      batches.push(inputs.slice(i, i + CHUNK));
    }

    const outputs: InsightOut[] = [];
    for (const batch of batches) {
      const out = await this.callWithRetry(batch);
      if (out) outputs.push(...out);
    }

    const byId = new Map(outputs.map(o => [o.id, o]));
    const version = `openai:${this.model}:${PROMPT_VERSION}`;
    const now = new Date().toISOString();

    // 4) Merge outputs into each TestResult (fallback per-row if missing)
    const updatedResults: TestResult[] = row.results.map(r => {
      const aiResult = byId.get(r.id);
      return {
        ...r,
        aiNote: aiResult?.aiNote ?? getDefaultNote(r.testName, r.status, r.value, r.unit),
        aiConfidence: aiResult?.confidence ?? 0.2,
        aiModel: aiResult ? aiResult.sourceModel : 'fallback:rules',
        aiVersion: version,
        aiTimestamp: now,
      };
    });

    // 5) Persist back into the JSON column
    await this.bloodworkRepository.update(
      { id: row.id },
      { results: updatedResults }
    );

    this.log.log(`AI notes persisted (${outputs.length}/${inputs.length}) for analysis ${analysisId}`);
  }

  private async callWithRetry(batch: TestResultInput[]): Promise<InsightOut[] | null> {
    try {
      return await this.callOnce(batch);
    } catch (error) {
      this.log.warn(`AI call failed, retrying: ${error.message}`);
      // Wait 300-1200ms before retry
      await new Promise(r => setTimeout(r, 300 + Math.floor(Math.random() * 900)));
      
      try {
        return await this.callOnce(batch);
      } catch (retryError) {
        this.log.warn(`AI batch failed twice: ${retryError.message}`);
        return null;
      }
    }
  }

  private async callOnce(items: TestResultInput[]): Promise<InsightOut[]> {
    const resp = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.2,
      max_tokens: 900,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: BATCH_USER_TEMPLATE(items) },
      ],
    }, {
      timeout: 7000,
    });

    const rawContent = resp.choices?.[0]?.message?.content?.trim() ?? '[]';

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch {
      // Try to salvage array from response
      const s = rawContent.indexOf('[');
      const e = rawContent.lastIndexOf(']');
      if (s >= 0 && e > s) {
        parsed = JSON.parse(rawContent.slice(s, e + 1));
      } else {
        throw new Error(`Invalid JSON from model: ${rawContent.slice(0, 180)}...`);
      }
    }

    const array = Array.isArray(parsed) ? parsed : (parsed as any)?.data ?? [];
    const validated = InsightOutArraySchema.parse(array) as Omit<InsightOut, 'sourceModel'>[];

    return validated.map(v => ({
      ...v,
      sourceModel: `openai:${this.model}` 
    }));
  }
}
