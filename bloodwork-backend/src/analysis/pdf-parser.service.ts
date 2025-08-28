/**
 * PDF Parser Service - Real PDF text extraction and bloodwork data parsing
 * 
 * WHY: Extracts actual test results from uploaded PDF reports instead of using mock data.
 * Handles various lab report formats and converts them to structured data.
 */

import { Injectable, Logger } from '@nestjs/common';
import { TestResult } from '../common/entities/bloodwork-result.entity';
import * as fs from 'fs';
import { BloodworkParseResult } from './responses';
import { PatientInfo } from './types';
import { extractPatientName, extractTestDate, parseTestResults, determineTestType } from './utils';
const pdfParse = require('pdf-parse');

@Injectable()
export class PdfParserService {
  private readonly logger = new Logger(PdfParserService.name);

  /**
   * Extract text content from PDF file
   */
  async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text;
    } catch (error) {
      this.logger.error(`Failed to extract PDF text: ${error.message}`);
      throw new Error(`PDF extraction failed: ${error.message}`);
    }
  }

  /**
   * Parse bloodwork results from PDF text content
   * Handles various lab report formats including hormone panels
   */
  async parseBloodworkResults(filePath: string): Promise<BloodworkParseResult> {
    const text = await this.extractTextFromPdf(filePath);
    this.logger.log(`Extracted PDF text (${text.length} chars), parsing bloodwork data...`);

    // DEBUG: Log first 500 chars of PDF to see the format
    this.logger.debug(`PDF text preview: ${text.substring(0, 500).replace(/\n/g, '\\n')}`);

    // Extract patient info using utility functions
    const patientName = extractPatientName(text);
    const testDate = extractTestDate(text, this.logger);
    
    // Parse test results using utility functions
    const testResults = parseTestResults(text, this.logger);
    
    // Determine test type using utility functions
    const testType = determineTestType(testResults);

    this.logger.log(`Parsed ${testResults.length} test results from PDF`);
    
    const patientInfo: PatientInfo = {
      name: patientName
    };

    return {
      testResults,
      testType,
      testDate,
      patientInfo
    };
  }
}
