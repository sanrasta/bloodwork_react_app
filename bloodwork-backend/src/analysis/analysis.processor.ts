/**
 * Analysis Processor - Background worker for AI analysis simulation
 * 
 * WHY: This is the actual "AI analysis" engine that runs in the background.
 * While your React Native app polls for progress, this processor simulates
 * the complex AI work of parsing PDFs and analyzing bloodwork data.
 * 
 * FUNCTIONALITY:
 * - Processes jobs from the Bull queue asynchronously
 * - Simulates realistic AI analysis timing and progress
 * - Updates job status and progress for React Native polling
 * - Generates mock bloodwork results for development
 * - Handles errors and retries for robust processing
 * 
 * RELATIONSHIP TO YOUR APP:
 * User taps "Analyze" -> Job queued -> This processor runs in background
 * React Native polls job status -> Sees progress updates from this processor
 * Processing completes -> React Native gets resultId -> Shows ResultSummary
 */

import { Process, Processor, OnQueueActive, OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable, Logger } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { ResultsService } from '../results/results.service';
import { JobStatus } from '../common/entities/analysis-job.entity';

/**
 * Job data interface for type safety
 * 
 * WHY: Ensures the job data passed from AnalysisService
 * matches what this processor expects to receive.
 */
interface BloodworkJobData {
  jobId: string;
  uploadId: string;
  filePath: string;
  originalName: string;
}

@Injectable()
@Processor('bloodwork-analysis')
export class AnalysisProcessor {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private readonly analysisService: AnalysisService,
    private readonly resultsService: ResultsService,
  ) {}

  /**
   * Main processing method - simulates AI analysis workflow
   * 
   * WHY: This method runs the complete analysis pipeline that your
   * React Native app expects. It simulates realistic timing and
   * provides progress updates that drive your UI animations.
   * 
   * ANALYSIS PIPELINE:
   * 1. PDF parsing and text extraction (10-30% progress)
   * 2. Data structure recognition (30-60% progress)
   * 3. AI analysis and classification (60-90% progress)
   * 4. Result generation and validation (90-100% progress)
   * 
   * PROGRESS UPDATES:
   * Your useAnalysisJob hook receives these progress updates
   * and your AnalysisProgress component shows the progress bar
   */
  @Process('processBloodwork')
  async handleBloodworkAnalysis(job: Job<BloodworkJobData>): Promise<void> {
    const { jobId, uploadId, filePath, originalName } = job.data;
    
    this.logger.log(`Starting analysis for job ${jobId}, file: ${originalName}`);

    try {
      // Phase 1: Initialize and validate file
      await this.updateJobProgress(jobId, JobStatus.RUNNING, 5);
      await this.simulateProcessingDelay(1000); // 1 second

      // Phase 2: PDF parsing simulation
      this.logger.log(`Parsing PDF for job ${jobId}`);
      await this.simulatePdfParsing(jobId);

      // Phase 3: Data extraction simulation
      this.logger.log(`Extracting data for job ${jobId}`);
      await this.simulateDataExtraction(jobId);

      // Phase 4: AI analysis simulation
      this.logger.log(`Running AI analysis for job ${jobId}`);
      await this.simulateAiAnalysis(jobId);

      // Phase 5: Generate mock results
      this.logger.log(`Generating results for job ${jobId}`);
      const mockResults = this.generateMockBloodworkResults(originalName);

      // Phase 6: Save results to database
      const result = await this.resultsService.createResult({
        jobId,
        ...mockResults,
      });

      // Phase 7: Complete the job
      await this.analysisService.updateJobStatus(jobId, {
        status: JobStatus.COMPLETED,
        progress: 100,
        resultId: result.id,
      });

      this.logger.log(`Analysis completed for job ${jobId}, result: ${result.id}`);

    } catch (error) {
      this.logger.error(`Analysis failed for job ${jobId}:`, error);
      
      await this.analysisService.updateJobStatus(jobId, {
        status: JobStatus.FAILED,
        errorMessage: error.message || 'Unknown error during analysis',
      });
      
      // Re-throw to mark job as failed in Bull
      throw error;
    }
  }

  /**
   * Simulates PDF parsing with realistic progress updates
   * 
   * WHY: Real PDF parsing takes time and has multiple steps.
   * This simulation provides realistic timing and progress
   * that matches what users would expect from actual AI processing.
   */
  private async simulatePdfParsing(jobId: string): Promise<void> {
    // Simulate text extraction
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 15);
    await this.simulateProcessingDelay(2000);

    // Simulate structure analysis
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 25);
    await this.simulateProcessingDelay(1500);

    // Simulate table detection
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 35);
    await this.simulateProcessingDelay(1000);
  }

  /**
   * Simulates data extraction with medical context
   * 
   * WHY: Extracting structured medical data from PDFs is complex.
   * This simulation reflects the multiple steps involved in
   * identifying test names, values, units, and reference ranges.
   */
  private async simulateDataExtraction(jobId: string): Promise<void> {
    // Simulate test identification
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 45);
    await this.simulateProcessingDelay(2000);

    // Simulate value extraction
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 55);
    await this.simulateProcessingDelay(1500);

    // Simulate reference range matching
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 65);
    await this.simulateProcessingDelay(1000);
  }

  /**
   * Simulates AI analysis and classification
   * 
   * WHY: The actual AI analysis (classification, anomaly detection,
   * trend analysis) is the most time-consuming part. This simulation
   * provides realistic timing for the "heavy computation" phase.
   */
  private async simulateAiAnalysis(jobId: string): Promise<void> {
    // Simulate classification
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 75);
    await this.simulateProcessingDelay(3000);

    // Simulate anomaly detection
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 85);
    await this.simulateProcessingDelay(2000);

    // Simulate report generation
    await this.updateJobProgress(jobId, JobStatus.RUNNING, 95);
    await this.simulateProcessingDelay(1000);
  }

  /**
   * Updates job progress in database
   * 
   * WHY: This is how your React Native polling gets updated progress.
   * Each progress update triggers a database write that your
   * useAnalysisJob hook detects on the next poll.
   */
  private async updateJobProgress(
    jobId: string, 
    status: JobStatus, 
    progress: number
  ): Promise<void> {
    await this.analysisService.updateJobStatus(jobId, { status, progress });
    this.logger.debug(`Job ${jobId} progress: ${progress}%`);
  }

  /**
   * Simulates realistic processing delays
   * 
   * WHY: Real AI processing takes time. These delays simulate
   * the actual computational overhead of PDF parsing, data
   * extraction, and machine learning inference.
   */
  private async simulateProcessingDelay(ms: number): Promise<void> {
    // Add some randomness to make it feel more realistic
    const jitter = Math.random() * 500; // Up to 500ms additional delay
    await new Promise(resolve => setTimeout(resolve, ms + jitter));
  }

  /**
   * Generates realistic mock bloodwork results
   * 
   * WHY: Until you integrate real AI services, this generates
   * realistic test data that matches the structure your React Native
   * ResultSummary component expects to display.
   * 
   * MOCK DATA FEATURES:
   * - Realistic test names and values
   * - Proper reference ranges
   * - Mix of normal, high, low, and critical results
   * - Contextual doctor notes
   */
  private generateMockBloodworkResults(originalFileName: string) {
    // Generate realistic test results with varied statuses
    const results = [
      {
        id: '1',
        testName: 'Hemoglobin',
        value: this.generateRealisticValue(13.5, 17.5, 0.1), // Usually normal
        unit: 'g/dL',
        referenceRange: { min: 13.5, max: 17.5 },
        status: this.determineStatus(15.2, 13.5, 17.5),
      },
      {
        id: '2',
        testName: 'White Blood Cell Count',
        value: this.generateRealisticValue(4.5, 11.0, 0.2), // Usually normal
        unit: '10^3/μL',
        referenceRange: { min: 4.5, max: 11.0 },
        status: this.determineStatus(8.5, 4.5, 11.0),
      },
      {
        id: '3',
        testName: 'Platelet Count',
        value: this.generateRealisticValue(150, 400, 0.15), // Sometimes high
        unit: '10^3/μL',
        referenceRange: { min: 150, max: 400 },
        status: this.determineStatus(420, 150, 400),
      },
      {
        id: '4',
        testName: 'Total Cholesterol',
        value: this.generateRealisticValue(100, 200, 0.25), // Sometimes high
        unit: 'mg/dL',
        referenceRange: { min: 100, max: 200 },
        status: this.determineStatus(185, 100, 200),
      },
      {
        id: '5',
        testName: 'Blood Glucose',
        value: this.generateRealisticValue(70, 100, 0.2), // Sometimes high
        unit: 'mg/dL',
        referenceRange: { min: 70, max: 100 },
        status: this.determineStatus(95, 70, 100),
      },
    ];

    // Generate contextual doctor notes based on results
    const abnormalResults = results.filter(r => r.status !== 'normal');
    const doctorNotes = this.generateDoctorNotes(abnormalResults, originalFileName);

    return {
      testType: 'Complete Blood Count with Metabolic Panel',
      testDate: this.generateRecentTestDate(),
      results,
      doctorNotes,
      status: 'completed',
    };
  }

  /**
   * Generates realistic test values with some variation
   */
  private generateRealisticValue(min: number, max: number, abnormalChance: number): number {
    if (Math.random() < abnormalChance) {
      // Generate abnormal value (outside normal range)
      const isHigh = Math.random() > 0.5;
      if (isHigh) {
        return Number((max + (max * 0.1 * Math.random())).toFixed(1));
      } else {
        return Number((min - (min * 0.1 * Math.random())).toFixed(1));
      }
    } else {
      // Generate normal value (within range)
      return Number((min + (max - min) * Math.random()).toFixed(1));
    }
  }

  /**
   * Determines result status based on value and reference range
   */
  private determineStatus(value: number, min: number, max: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < min * 0.5 || value > max * 2) return 'critical';
    if (value < min) return 'low';
    if (value > max) return 'high';
    return 'normal';
  }

  /**
   * Generates contextual doctor notes based on abnormal results
   */
  private generateDoctorNotes(abnormalResults: any[], fileName: string): string {
    if (abnormalResults.length === 0) {
      return 'Overall results are within normal limits. Continue current health regimen and retest in 6 months.';
    }

    const notes = ['Results review:'];
    
    abnormalResults.forEach(result => {
      if (result.status === 'high') {
        notes.push(`• ${result.testName} is elevated (${result.value} ${result.unit}). Consider dietary modifications and retest in 3 months.`);
      } else if (result.status === 'low') {
        notes.push(`• ${result.testName} is below normal (${result.value} ${result.unit}). May require supplementation or further evaluation.`);
      } else if (result.status === 'critical') {
        notes.push(`• ${result.testName} is critically abnormal (${result.value} ${result.unit}). Immediate medical attention recommended.`);
      }
    });

    notes.push('Please discuss these results with your healthcare provider for personalized recommendations.');
    
    return notes.join(' ');
  }

  /**
   * Generates a recent test date for realistic results
   */
  private generateRecentTestDate(): string {
    const daysAgo = Math.floor(Math.random() * 30); // Within last 30 days
    const testDate = new Date();
    testDate.setDate(testDate.getDate() - daysAgo);
    return testDate.toISOString();
  }

  /**
   * Bull queue event handlers for monitoring
   */
  @OnQueueActive()
  onActive(job: Job<BloodworkJobData>) {
    this.logger.log(`Processing job ${job.data.jobId} for file: ${job.data.originalName}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job<BloodworkJobData>) {
    this.logger.log(`Completed job ${job.data.jobId} successfully`);
  }

  @OnQueueFailed()
  onFailed(job: Job<BloodworkJobData>, err: Error) {
    this.logger.error(`Failed job ${job.data.jobId}: ${err.message}`);
  }
}
