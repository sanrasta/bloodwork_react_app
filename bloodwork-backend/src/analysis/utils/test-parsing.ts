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

  // Parse tabular format (like Vietnamese Hi-Lab reports)
  const tableResults = parseTabularFormat(text, logger);
  results.push(...tableResults);
  
  // Parse multi-line format (where test data is split across lines)
  const multiLineResults = parseMultiLineFormat(text, logger);
  results.push(...multiLineResults);

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
 * Parse tabular format lab reports (like Vietnamese Hi-Lab format)
 * Handles table-like structure with columns: Test Name | Results | Reference Range | Unit
 */
function parseTabularFormat(text: string, logger?: Logger): TestResult[] {
  const results: TestResult[] = [];
  
  // Look for table-like patterns in the text
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  logger?.debug(`🔍 Parsing ${lines.length} lines for tabular format`);
  logger?.debug(`📄 Sample lines: ${lines.slice(0, 20).join(' | ')}`);
  
  // Find lines that look like test results with numbers and reference ranges
  for (const line of lines) {
    logger?.debug(`🔍 Checking line: "${line}"`);
    
    // Pattern for lines like: "AST (SGOT) 25 <=37 U/L"
    // Or: "Urea 7.76 2.5-7.5 mmol/L"
    // Or: "Creatinin 101.8 Male : 62-120 ; Female: 53-100; Children: 27-62 μmol/L"
    
    const patterns = [
      // Pattern 1: "TestName Value <=MaxRef Unit"
      /^([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+<=(\d+(?:\.\d+)?)\s+([A-Za-z\/μ]+)$/,
      
      // Pattern 2: "TestName Value MinRef-MaxRef Unit"  
      /^([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s+([A-Za-z\/μ]+)$/,
      
      // Pattern 3: "TestName Value >=MinRef Unit"
      /^([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+>=(\d+(?:\.\d+)?)\s+([A-Za-z\/μ]+)$/,
      
      // Pattern 4: "TestName <Value <MaxRef Unit" (for CRP)
      /^([A-Za-z\s\(\)]+?)\s+<(\d+(?:\.\d+)?)\s+<(\d+(?:\.\d+)?)\s+([A-Za-z\/μ]+)$/,
      
      // Pattern 5: Complex reference ranges with Male/Female (extract just male range for now)
      /^([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+Male\s*:\s*(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*[;\s]*.*?([A-Za-z\/μ]+)$/,
      
      // Pattern 6: More flexible - any test name followed by number and reference
      /([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+([<>=]*\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s+([A-Za-z\/μ]+)/,
      
      // Pattern 7: Table format with multiple spaces/tabs
      /^(\d+)\s+([A-Za-z\s\(\)]+?)\s+(\d+(?:\.\d+)?)\s+([<>=]*\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s+([A-Za-z\/μ]+)/,
    ];
    
    for (let patternIndex = 0; patternIndex < patterns.length; patternIndex++) {
      const match = line.match(patterns[patternIndex]);
      if (match) {
        let testName: string, value: number, minRef: number, maxRef: number, unit: string;
        
        switch (patternIndex) {
          case 0: // <=MaxRef pattern
            [, testName, , , unit] = match;
            value = parseFloat(match[2]);
            minRef = 0;
            maxRef = parseFloat(match[3]);
            break;
            
          case 1: // MinRef-MaxRef pattern
            [, testName, , , , unit] = match;
            value = parseFloat(match[2]);
            minRef = parseFloat(match[3]);
            maxRef = parseFloat(match[4]);
            break;
            
          case 2: // >=MinRef pattern
            [, testName, , , unit] = match;
            value = parseFloat(match[2]);
            minRef = parseFloat(match[3]);
            maxRef = 999999; // No upper limit
            break;
            
          case 3: // <Value <MaxRef pattern
            [, testName, , , unit] = match;
            value = parseFloat(match[2]);
            minRef = 0;
            maxRef = parseFloat(match[3]);
            break;
            
          case 4: // Male: MinRef-MaxRef pattern
            [, testName, , , , unit] = match;
            value = parseFloat(match[2]);
            minRef = parseFloat(match[3]);
            maxRef = parseFloat(match[4]);
            break;
            
          case 5: // Flexible pattern
            [, testName, , , unit] = match;
            value = parseFloat(match[2]);
            const refRange = match[3];
            if (refRange.includes('-')) {
              const [min, max] = refRange.replace(/[<>=]/g, '').split('-');
              minRef = parseFloat(min);
              maxRef = parseFloat(max);
            } else if (refRange.startsWith('<=')) {
              minRef = 0;
              maxRef = parseFloat(refRange.replace('<=', ''));
            } else if (refRange.startsWith('>=')) {
              minRef = parseFloat(refRange.replace('>=', ''));
              maxRef = 999999;
            } else {
              minRef = 0;
              maxRef = parseFloat(refRange.replace(/[<>=]/g, ''));
            }
            break;
            
          case 6: // Table format with row number
            [, , testName, , , unit] = match;
            value = parseFloat(match[3]);
            const refRange2 = match[4];
            if (refRange2.includes('-')) {
              const [min, max] = refRange2.replace(/[<>=]/g, '').split('-');
              minRef = parseFloat(min);
              maxRef = parseFloat(max);
            } else if (refRange2.startsWith('<=')) {
              minRef = 0;
              maxRef = parseFloat(refRange2.replace('<=', ''));
            } else if (refRange2.startsWith('>=')) {
              minRef = parseFloat(refRange2.replace('>=', ''));
              maxRef = 999999;
            } else {
              minRef = 0;
              maxRef = parseFloat(refRange2.replace(/[<>=]/g, ''));
            }
            break;
            
          default:
            continue;
        }
        
        // Clean up test name
        testName = testName.trim().replace(/\s+/g, ' ');
        
        // Handle special units
        if (unit.includes('μ')) {
          unit = unit.replace('μ', 'μ'); // Ensure proper unicode
        }
        
        const testResult: TestResult = {
          id: (results.length + 1).toString(),
          testName,
          value,
          unit,
          referenceRange: { min: minRef, max: maxRef },
          status: determineTestStatus(value, minRef, maxRef)
        };
        
        results.push(testResult);
        logger?.log(`✅ Parsed ${testName}: ${value} ${unit} (${minRef}-${maxRef}) - ${testResult.status} [Pattern ${patternIndex}]`);
        break; // Found a match, don't try other patterns for this line
      }
    }
  }
  
  return results;
}

/**
 * Parse multi-line format where test data is split across separate lines
 * Example:
 * AST (SGOT)
 * 25
 * <=37
 * U/L
 */
function parseMultiLineFormat(text: string, logger?: Logger): TestResult[] {
  const results: TestResult[] = [];
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  logger?.debug(`🔍 Multi-line parsing ${lines.length} lines`);
  
  // Look for test patterns where data spans 4-6 consecutive lines
  for (let i = 0; i < lines.length - 3; i++) {
    const testNameLine = lines[i];
    const valueLine = lines[i + 1];
    let refRangeLine = lines[i + 2];
    let unitLine = lines[i + 3];
    
    // Handle multi-line reference ranges (like Creatinin with Male/Female/Children)
    if (refRangeLine.match(/^Male\s*:\s*\d+/) && i + 5 < lines.length) {
      // For complex ranges, look for the unit line further down
      if (lines[i + 5].match(/^[A-Za-z\/μ]+[A-Za-z\/]*$/)) {
        unitLine = lines[i + 5];
      } else if (lines[i + 4].match(/^[A-Za-z\/μ]+[A-Za-z\/]*$/)) {
        unitLine = lines[i + 4];
      }
    }
    
    // Handle Adults: format (like Serum Zinc)
    if (refRangeLine.match(/^Adults:\s*\d+/) && i + 5 < lines.length) {
      if (lines[i + 4].match(/^[A-Za-z\/μ]+[A-Za-z\/]*$/)) {
        unitLine = lines[i + 4];
      } else if (lines[i + 5].match(/^[A-Za-z\/μ]+[A-Za-z\/]*$/)) {
        unitLine = lines[i + 5];
      }
    }
    
    // Skip if any line looks like a header or number-only line
    if (testNameLine.match(/^(No\.|Test Name|Results|Reference range|Unit|SOP|\d+|AU \d+|Cobas E\d+|Biochemistry|Immunology)$/i)) {
      continue;
    }
    
    // Check if this looks like a test name (contains letters, may have parentheses, numbers, hyphens)
    if (!testNameLine.match(/^[A-Za-z\s\(\)\-0-9]+$/)) {
      continue;
    }
    
    // Skip very short names that are likely not test names
    if (testNameLine.length < 3) {
      continue;
    }
    
    // Check if value line is a number or special format like <6
    let valueMatch = valueLine.match(/^(\d+(?:\.\d+)?)$/);
    let isLessThan = false;
    
    if (!valueMatch) {
      // Try to match <number format (e.g., <6 for CRP)
      valueMatch = valueLine.match(/^<(\d+(?:\.\d+)?)$/);
      if (valueMatch) {
        isLessThan = true;
      } else {
        continue;
      }
    }
    
    // Check if unit line looks like a unit (including μIU/mL, ng/ml, pmol/L, pg/ml)
    if (!unitLine.match(/^[A-Za-z\/μ]+[A-Za-z\/]*$/)) {
      continue;
    }
    
    let value = parseFloat(valueMatch[1]);
    
    // For <number values, use the number but mark it as "less than"
    if (isLessThan) {
      // Use half the threshold value as the actual value for display
      value = value * 0.5;
    }
    
    let minRef = 0;
    let maxRef = 999999;
    
    // Parse reference range
    if (refRangeLine.match(/^<=\s*(\d+(?:\.\d+)?)$/)) {
      // Upper limit only: <=37 or <= 3.4
      maxRef = parseFloat(refRangeLine.replace(/<=\s*/, ''));
      minRef = 0;
    } else if (refRangeLine.match(/^>=\s*(\d+(?:\.\d+)?)$/)) {
      // Lower limit only: >= 0.9
      minRef = parseFloat(refRangeLine.replace(/>=\s*/, ''));
      maxRef = 999999;
    } else if (refRangeLine.match(/^<(\d+)$/)) {
      // Less than: <6 (for CRP)
      maxRef = parseFloat(refRangeLine.replace('<', ''));
      minRef = 0;
    } else if (refRangeLine.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)) {
      // Range: 2.5-7.5, 20-50, 12-22
      const rangeParts = refRangeLine.split('-');
      minRef = parseFloat(rangeParts[0]);
      maxRef = parseFloat(rangeParts[1]);
    } else if (refRangeLine.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/)) {
      // Range with spaces: 2.00 -4.40
      const rangeParts = refRangeLine.split(/\s*-\s*/);
      minRef = parseFloat(rangeParts[0]);
      maxRef = parseFloat(rangeParts[1]);
    } else if (refRangeLine.match(/^Male\s*:\s*(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/)) {
      // Male-specific range: Male : 62-120 ;
      const match = refRangeLine.match(/^Male\s*:\s*(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)/);
      if (match) {
        minRef = parseFloat(match[1]);
        maxRef = parseFloat(match[2]);
      }
    } else if (refRangeLine.match(/^Adults:\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/)) {
      // Adults range: Adults: 9.18 - 18.4
      const match = refRangeLine.match(/^Adults:\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)/);
      if (match) {
        minRef = parseFloat(match[1]);
        maxRef = parseFloat(match[2]);
      }
    } else {
      // For debugging: log unmatched reference ranges
      logger?.debug(`❌ Unmatched reference range: "${refRangeLine}"`);
      continue;
    }
    
    const testResult: TestResult = {
      id: (results.length + 1).toString(),
      testName: testNameLine.trim(),
      value,
      unit: unitLine.trim(),
      referenceRange: { min: minRef, max: maxRef },
      status: determineTestStatus(value, minRef, maxRef)
    };
    
    results.push(testResult);
    logger?.log(`✅ Multi-line parsed ${testNameLine}: ${value} ${unitLine} (${minRef}-${maxRef}) - ${testResult.status}`);
  }
  
  // Fallback: Look for any remaining test patterns with flexible spacing
  if (results.length < 10) { // If we haven't found enough tests
    logger?.debug(`🔍 Fallback parsing - found ${results.length} tests so far`);
    
    for (let i = 0; i < lines.length - 2; i++) {
      const line1 = lines[i];
      const line2 = lines[i + 1];
      const line3 = lines[i + 2];
      
      // Look for pattern: TestName, Value, Range (unit might be separate or combined)
      if (line1.match(/^[A-Za-z\s\(\)\-0-9]+$/) && 
          line1.length > 2 &&
          !line1.match(/^(No\.|Test Name|Results|Reference range|Unit|SOP|\d+|AU \d+|Cobas E\d+|Biochemistry|Immunology|Male|Female|Children|Adults|Child)$/i)) {
        
        let valueMatch = line2.match(/^(\d+(?:\.\d+)?)$/);
        let isLessThan = false;
        
        if (!valueMatch) {
          valueMatch = line2.match(/^<(\d+(?:\.\d+)?)$/);
          if (valueMatch) isLessThan = true;
        }
        
        if (valueMatch && line3.match(/[\d\-<>=\.]/)) {
          // Check if we already have this test
          const testExists = results.some(r => r.testName.toLowerCase() === line1.toLowerCase());
          if (!testExists) {
            let value = parseFloat(valueMatch[1]);
            if (isLessThan) value = value * 0.5;
            
            let minRef = 0, maxRef = 999999;
            
            // Simple range parsing for fallback
            if (line3.match(/^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/)) {
              const parts = line3.split('-');
              minRef = parseFloat(parts[0]);
              maxRef = parseFloat(parts[1]);
            } else if (line3.match(/^<=\s*(\d+(?:\.\d+)?)$/)) {
              maxRef = parseFloat(line3.replace(/<=\s*/, ''));
            } else if (line3.match(/^>=\s*(\d+(?:\.\d+)?)$/)) {
              minRef = parseFloat(line3.replace(/>=\s*/, ''));
              maxRef = 999999;
            }
            
            const testResult: TestResult = {
              id: (results.length + 1).toString(),
              testName: line1.trim(),
              value,
              unit: 'unit', // Generic unit for fallback
              referenceRange: { min: minRef, max: maxRef },
              status: determineTestStatus(value, minRef, maxRef)
            };
            
            results.push(testResult);
            logger?.log(`✅ Fallback parsed ${line1}: ${value} (${minRef}-${maxRef}) - ${testResult.status}`);
          }
        }
      }
    }
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
