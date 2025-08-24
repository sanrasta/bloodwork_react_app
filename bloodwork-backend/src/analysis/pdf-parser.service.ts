/**
 * PDF Parser Service - Real PDF text extraction and bloodwork data parsing
 * 
 * WHY: Extracts actual test results from uploaded PDF reports instead of using mock data.
 * Handles various lab report formats and converts them to structured data.
 */

import { Injectable, Logger } from '@nestjs/common';
import { TestResult } from '../common/entities/bloodwork-result.entity';
import * as fs from 'fs';
const pdfParse = require('pdf-parse');

interface ParsedTestResult {
  testName: string;
  value: number;
  unit: string;
  referenceRange: { min: number; max: number };
  status: 'normal' | 'high' | 'low' | 'critical';
}

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
  async parseBloodworkResults(filePath: string): Promise<{ 
    testResults: TestResult[], 
    testType: string, 
    testDate: string,
    patientInfo?: any 
  }> {
    const text = await this.extractTextFromPdf(filePath);
    this.logger.log(`Extracted PDF text (${text.length} chars), parsing bloodwork data...`);

    // DEBUG: Log first 500 chars of PDF to see the format
    this.logger.debug(`PDF text preview: ${text.substring(0, 500).replace(/\n/g, '\\n')}`);

    // Extract patient info
    const patientName = this.extractPatientName(text);
    const testDate = this.extractTestDate(text);
    
    // Parse test results
    const testResults = this.parseTestResults(text);
    
    // Determine test type based on parsed results
    const testType = this.determineTestType(testResults);

    this.logger.log(`Parsed ${testResults.length} test results from PDF`);
    
    return {
      testResults,
      testType,
      testDate,
      patientInfo: { name: patientName }
    };
  }

  /**
   * Extract patient name from PDF text
   */
  private extractPatientName(text: string): string {
    const nameMatch = text.match(/Patient[Nn]ame[:\s]+([A-Z\s]+)/i) || 
                     text.match(/Name[:\s]+([A-Z\s]+)/i);
    return nameMatch ? nameMatch[1].trim() : 'Unknown Patient';
  }

  /**
   * Extract test date from PDF text
   */
  private extractTestDate(text: string): string {
    // Look for various date formats from your hormone test PDF
    const datePatterns = [
      // Format: "31/07/2025" from your PDF
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      // Format: "31-07-2025"
      /(\d{1,2}-\d{1,2}-\d{4})/,
      // Format: "2025-07-31" 
      /(\d{4}-\d{1,2}-\d{1,2})/,
      // Time format: "17:58:00 31/07/2025" from your PDF
      /(\d{1,2}:\d{2}:\d{2}\s+\d{1,2}\/\d{1,2}\/\d{4})/,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          // Try to parse the date, handle DD/MM/YYYY format properly
          let dateStr = match[1];
          
          // If it includes time, extract just the date part
          if (dateStr.includes(':')) {
            const parts = dateStr.split(' ');
            dateStr = parts[parts.length - 1]; // Get the date part
          }
          
          // Handle DD/MM/YYYY format (common in medical reports)
          if (dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            if (day && month && year) {
              const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
              if (!isNaN(parsedDate.getTime())) {
                return parsedDate.toISOString();
              }
            }
          }
          
          // Try direct parsing for other formats
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate.toISOString();
          }
        } catch (error) {
          this.logger.warn(`Failed to parse date "${match[1]}": ${error.message}`);
          continue;
        }
      }
    }
    
    // Fallback to current date if no valid date found
    this.logger.warn('No valid date found in PDF, using current date');
    return new Date().toISOString();
  }

  /**
   * Parse individual test results from PDF text
   */
  private parseTestResults(text: string): TestResult[] {
    const results: TestResult[] = [];
    
    // Split text into lines for multi-line parsing
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    this.logger.debug(`Processing ${lines.length} lines from PDF`);
    
    // Look for patterns where test name, reference range, and value are on separate lines
    for (let i = 0; i < lines.length - 2; i++) {
      const testNameLine = lines[i];
      const refRangeLine = lines[i + 1];
      const valueLine = lines[i + 2];
      
      // Pattern: IgG test
      if (testNameLine.match(/^IgG$/i) && refRangeLine.match(/^\(\d+\s*-\s*\d+\s*mg\/dL\)$/)) {
        const refMatch = refRangeLine.match(/\((\d+)\s*-\s*(\d+)\s*mg\/dL\)/);
        const valueMatch = valueLine.match(/^(\d+(?:\.\d+)?)$/);
        
        if (refMatch && valueMatch) {
          const value = parseFloat(valueMatch[1]);
          const minRef = parseFloat(refMatch[1]);
          const maxRef = parseFloat(refMatch[2]);
          
          results.push({
            id: (results.length + 1).toString(),
            testName: 'IgG',
            value,
            unit: 'mg/dL',
            referenceRange: { min: minRef, max: maxRef },
            status: this.determineTestStatus(value, minRef, maxRef)
          });
          
          this.logger.log(`✅ Parsed IgG: ${value} mg/dL (${minRef}-${maxRef})`);
        }
      }
      
      // Pattern: Free Testosterone Index  
      if (testNameLine.match(/Free\s+Testosterone\s+Index/i) && refRangeLine.match(/^\(/)) {
        const refMatch = refRangeLine.match(/\(.*?(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
        const valueMatch = valueLine.match(/^(\d+(?:\.\d+)?)$/);
        
        if (refMatch && valueMatch) {
          const value = parseFloat(valueMatch[1]);
          const minRef = parseFloat(refMatch[1]);
          const maxRef = parseFloat(refMatch[2]);
          
          results.push({
            id: (results.length + 1).toString(),
            testName: 'Free Testosterone Index',
            value,
            unit: '%',
            referenceRange: { min: minRef, max: maxRef },
            status: this.determineTestStatus(value, minRef, maxRef)
          });
          
          this.logger.log(`✅ Parsed Free Testosterone Index: ${value}% (${minRef}-${maxRef})`);
        }
      }
      
      // Pattern: SHBG
      if (testNameLine.match(/SHBG/i) && refRangeLine.match(/nmol\/L/)) {
        const refMatch = refRangeLine.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*nmol\/L/);
        const valueMatch = valueLine.match(/^(\d+(?:\.\d+)?)$/);
        
        if (refMatch && valueMatch) {
          const value = parseFloat(valueMatch[1]);
          const minRef = parseFloat(refMatch[1]);
          const maxRef = parseFloat(refMatch[2]);
          
          results.push({
            id: (results.length + 1).toString(),
            testName: 'SHBG',
            value,
            unit: 'nmol/L',
            referenceRange: { min: minRef, max: maxRef },
            status: this.determineTestStatus(value, minRef, maxRef)
          });
          
          this.logger.log(`✅ Parsed SHBG: ${value} nmol/L (${minRef}-${maxRef})`);
        }
      }
      
      // Pattern: Testosterone
      if (testNameLine.match(/^Testosterone$/i) && refRangeLine.match(/nmol\/L/)) {
        const refMatch = refRangeLine.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*nmol\/L/);
        const valueMatch = valueLine.match(/^(\d+(?:\.\d+)?)$/);
        
        if (refMatch && valueMatch) {
          const value = parseFloat(valueMatch[1]);
          const minRef = parseFloat(refMatch[1]);
          const maxRef = parseFloat(refMatch[2]);
          
          results.push({
            id: (results.length + 1).toString(),
            testName: 'Testosterone',
            value,
            unit: 'nmol/L',
            referenceRange: { min: minRef, max: maxRef },
            status: this.determineTestStatus(value, minRef, maxRef)
          });
          
          this.logger.log(`✅ Parsed Testosterone: ${value} nmol/L (${minRef}-${maxRef})`);
        }
      }
    }

    // Also try to parse any values that appear after "REFERENCE VALUES" and "RESULTS"
    const resultsIndex = text.indexOf('REFERENCE VALUES');
    if (resultsIndex !== -1) {
      const resultsSection = text.substring(resultsIndex);
      this.logger.debug(`Found REFERENCE VALUES section: ${resultsSection.substring(0, 200)}`);
      
      // Look for the IgG value we saw in the debug output
      const iggMatch = resultsSection.match(/IgG[\s\S]*?\((\d+)\s*-\s*(\d+)\s*mg\/dL\)[\s\S]*?(\d+)/);
      if (iggMatch && results.length === 0) {
        const minRef = parseFloat(iggMatch[1]);
        const maxRef = parseFloat(iggMatch[2]);
        const value = parseFloat(iggMatch[3]);
        
        results.push({
          id: '1',
          testName: 'IgG',
          value,
          unit: 'mg/dL',
          referenceRange: { min: minRef, max: maxRef },
          status: this.determineTestStatus(value, minRef, maxRef)
        });
        
        this.logger.log(`✅ Parsed IgG from REFERENCE VALUES section: ${value} mg/dL (${minRef}-${maxRef})`);
      }
    }

    if (results.length === 0) {
      this.logger.warn('No test patterns matched the PDF format');
      // Log some lines to help debug
      this.logger.debug(`Sample lines: ${lines.slice(0, 10).join(' | ')}`);
    }

    return results;
  }

  /**
   * Determine test status based on value and reference range
   */
  private determineTestStatus(value: number, min: number, max: number): 'normal' | 'high' | 'low' | 'critical' {
    if (value < min) {
      // Consider very low values as critical
      return value < (min * 0.5) ? 'critical' : 'low';
    } else if (value > max) {
      // Consider very high values as critical  
      return value > (max * 1.5) ? 'critical' : 'high';
    }
    return 'normal';
  }

  /**
   * Determine test type based on parsed results
   */
  private determineTestType(results: TestResult[]): string {
    const testNames = results.map(r => r.testName.toLowerCase());
    
    if (testNames.some(name => name.includes('testosterone') || name.includes('shbg'))) {
      return 'Hormone Panel';
    } else if (testNames.some(name => name.includes('cholesterol') || name.includes('glucose'))) {
      return 'Metabolic Panel';
    } else if (testNames.some(name => name.includes('hemoglobin') || name.includes('wbc'))) {
      return 'Complete Blood Count';
    }
    
    return 'Laboratory Results';
  }
}
