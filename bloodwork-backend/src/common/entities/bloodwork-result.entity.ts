/**
 * Bloodwork Result Entity - Stores final AI analysis results
 * 
 * WHY: This is the end goal of your entire application - the analyzed bloodwork
 * data that users came to see. This entity stores structured medical data
 * that your ResultSummary component displays with insights and recommendations.
 * 
 * FUNCTIONALITY:
 * - Stores parsed and analyzed bloodwork test results
 * - Categorizes tests by status (normal, high, low, critical)
 * - Preserves test metadata (dates, types, reference ranges)
 * - Enables result sharing, printing, and historical comparison
 * 
 * RELATIONSHIP TO YOUR APP:
 * Background processor creates this entity when AI analysis completes
 * React Native ResultSummary -> GET /results/:resultId -> Reads this entity
 * Your app displays the structured data with charts and insights
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Individual test result structure
 * This matches your React Native types/types.ts TestResult interface
 */
export interface TestResult {
  id: string;
  testName: string;
  value: number;
  unit: string;
  referenceRange: {
    min: number;
    max: number;
  };
  status: 'normal' | 'high' | 'low' | 'critical';
}

@Entity('bloodwork_results')
export class BloodworkResult {
  /**
   * Primary key - This becomes the 'resultId' in your analysis job
   * Links completed analysis back to the job that created it
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key to AnalysisJob entity
   * Enables tracing results back to original job and upload
   */
  @Column()
  jobId: string;

  /**
   * Type of bloodwork test performed
   * Examples: "Complete Blood Count", "Lipid Panel", "Metabolic Panel"
   * Extracted from PDF or inferred by AI
   */
  @Column()
  testType: string;

  /**
   * Date when blood was drawn (extracted from PDF)
   * ISO string format for consistent date handling
   * Used by your app to show test recency
   */
  @Column()
  testDate: string;

  /**
   * Array of individual test results with values and statuses
   * Stored as JSON in database, typed as TestResult[] in TypeScript
   * Core data that drives your summary statistics and alerts
   */
  @Column('json')
  results: TestResult[];

  /**
   * AI-generated or doctor-provided notes about the results
   * Displayed in your ResultSummary notes section
   * Provides context and recommendations for abnormal values
   */
  @Column({ nullable: true })
  doctorNotes: string;

  /**
   * Overall status of the bloodwork analysis
   * Usually 'completed' but could be 'pending_review' for critical results
   */
  @Column({ default: 'completed' })
  status: string;

  /**
   * When the analysis was completed and results generated
   * Important for result validity and expiration policies
   */
  @CreateDateColumn()
  createdAt: Date;
}
