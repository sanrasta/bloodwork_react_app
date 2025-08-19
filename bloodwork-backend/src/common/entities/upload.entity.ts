/**
 * Upload Entity - Represents PDF files uploaded by users
 * 
 * WHY: This entity is crucial because your React Native app uploads PDF files
 * and we need to track them in the database. Every uploaded file gets a record
 * here with metadata and file system location.
 * 
 * FUNCTIONALITY:
 * - Stores file metadata (name, size, type)
 * - Tracks file system location for retrieval
 * - Provides unique ID for referencing in analysis jobs
 * - Enables file cleanup and audit trails
 * 
 * RELATIONSHIP TO YOUR APP:
 * React Native UploadCard -> POST /uploads -> Creates this entity -> Returns uploadId
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('uploads')
export class Upload {
  /**
   * Primary key - UUID format for security
   * This becomes the 'uploadId' that your React Native app receives
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Generated filename on server (with UUID to prevent conflicts)
   * Example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
   */
  @Column()
  filename: string;

  /**
   * Original filename from user's device
   * Example: "bloodwork-results-jan-2024.pdf"
   */
  @Column()
  originalName: string;

  /**
   * MIME type validation - ensures only PDFs
   * Should always be "application/pdf" due to our validation
   */
  @Column()
  mimetype: string;

  /**
   * File size in bytes - used for validation and storage management
   * Your React Native app validates 10MB max, this stores actual size
   */
  @Column()
  size: number;

  /**
   * File system path where the PDF is stored
   * Example: "./uploads/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf"
   */
  @Column()
  path: string;

  /**
   * When the file was uploaded - important for cleanup and auditing
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * When the record was last updated
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
