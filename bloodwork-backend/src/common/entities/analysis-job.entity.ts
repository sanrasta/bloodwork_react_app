/**
 * Analysis Job Entity - Tracks AI analysis processing jobs
 * 
 * WHY: This is the heart of your background processing system. When a user
 * taps "Analyze" in your React Native app, this entity tracks the entire
 * lifecycle from "queued" to "completed". Your app polls this for progress.
 * 
 * FUNCTIONALITY:
 * - Manages job state machine (queued -> running -> completed/failed)
 * - Tracks progress percentage for user feedback
 * - Links uploads to results through foreign keys
 * - Enables job recovery and retry mechanisms
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native startAnalysisFlow -> POST /analysis -> Creates this entity
 * React Native useAnalysisJob -> GET /analysis/:jobId -> Reads this entity
 * Background processor updates this entity's status and progress
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * Job Status Enum - Represents the state machine of analysis processing
 * This directly maps to your React Native app's step transitions
 */
export enum JobStatus {
  QUEUED = 'queued',     // Job created, waiting for processor
  RUNNING = 'running',   // AI analysis in progress
  COMPLETED = 'completed', // Analysis finished successfully
  FAILED = 'failed',     // Analysis failed with error
}

@Entity('analysis_jobs')
export class AnalysisJob {
  /**
   * Primary key - This becomes the 'jobId' that your React Native app polls
   * UUID format for security and unpredictability
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * User ID from Clerk authentication
   * Associates this job with the authenticated user
   */
  @Column()
  userId: string;

  /**
   * Foreign key to Upload entity
   * Links this job to the specific PDF file being analyzed
   */
  @Column()
  uploadId: string;

  /**
   * Current job status - drives your React Native UI state
   * Your useAnalysisJob hook reads this to show appropriate components
   */
  @Column({
    type: 'varchar',
    enum: JobStatus,
    default: JobStatus.QUEUED,
  })
  status: JobStatus;

  /**
   * Progress percentage (0-100)
   * Used by your AnalysisProgress component to show progress bar
   * Updated by background processor during AI analysis
   */
  @Column({ nullable: true })
  progress: number;

  /**
   * Foreign key to BloodworkResult entity
   * Set when analysis completes successfully
   * Used by your ResultSummary component to fetch results
   */
  @Column({ nullable: true })
  resultId: string;

  /**
   * Error message if job fails
   * Displayed in your AnalysisProgress error state
   * Helps debug issues with PDF processing or AI analysis
   */
  @Column({ nullable: true })
  errorMessage: string;

  /**
   * Job creation timestamp
   * Used for job timeout and cleanup policies
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Last update timestamp
   * Updated every time progress changes or status updates
   * Your polling mechanism uses this to detect changes
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
