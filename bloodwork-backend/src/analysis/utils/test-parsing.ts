/**
 * Test Parsing Utilities
 * 
 * WHY: Pure functions for parsing individual test results from PDF text.
 * These utilities handle the complex pattern matching required to extract
 * test values, reference ranges, and units from various lab report formats.
 * 
 * FUNCTIONALITY:
 * - Parse test results using multi-line pattern matching
 * - Extract reference ranges and units
 * - Determine test status based on values vs reference ranges
 * - Handle various lab report formats (IgG, Testosterone, SHBG, etc.)
 * 
 * BENEFITS:
 * - Pure functions - highly testable and maintainable
 * - Modular - can add new test patterns without affecting others
 * - Reusable - other parsing services can use the same logic
 */

import { Logger } from '@nestjs/common';
import { TestResult } from '../../common/entities/bloodwork-result.entity';

export type TestStatus = 'normal' | 'high' | 'low' | 'critical';

/**
 * Parse individual test results from PDF text content
 */
export function parseTestResults(text: string, logger?: Logger): TestResult[] {
  const results: TestResult[] = [];
  
  // Split text into lines for multi-line parsing
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  logger?.debug(`Processing ${lines.length} lines from PDF`);
  
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
          status: determineTestStatus(value, minRef, maxRef)
        });
        
        logger?.log(`✅ Parsed IgG: ${value} mg/dL (${minRef}-${maxRef})`);
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
          status: determineTestStatus(value, minRef, maxRef)
        });
        
        logger?.log(`✅ Parsed Free Testosterone Index: ${value}% (${minRef}-${maxRef})`);
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
          status: determineTestStatus(value, minRef, maxRef)
        });
        
        logger?.log(`✅ Parsed SHBG: ${value} nmol/L (${minRef}-${maxRef})`);
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
          status: determineTestStatus(value, minRef, maxRef)
        });
        
        logger?.log(`✅ Parsed Testosterone: ${value} nmol/L (${minRef}-${maxRef})`);
      }
    }
  }

  // Also try to parse any values that appear after "REFERENCE VALUES" and "RESULTS"
  const resultsIndex = text.indexOf('REFERENCE VALUES');
  if (resultsIndex !== -1) {
    const resultsSection = text.substring(resultsIndex);
    logger?.debug(`Found REFERENCE VALUES section: ${resultsSection.substring(0, 200)}`);
    
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
        status: determineTestStatus(value, minRef, maxRef)
      });
      
      logger?.log(`✅ Parsed IgG from REFERENCE VALUES section: ${value} mg/dL (${minRef}-${maxRef})`);
    }
  }

  if (results.length === 0) {
    logger?.warn('No test patterns matched the PDF format');
    // Log some lines to help debug
    logger?.debug(`Sample lines: ${lines.slice(0, 10).join(' | ')}`);
  }

  return results;
}

/**
 * Determine test status based on value and reference range
 */
export function determineTestStatus(value: number, min: number, max: number): TestStatus {
  if (value < min) {
    // Consider very low values as critical
    return value < (min * 0.5) ? 'critical' : 'low';
  } else if (value > max) {
    // Consider very high values as critical  
    return value > (max * 1.5) ? 'critical' : 'high';
  }
  return 'normal';
}
