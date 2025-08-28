/**
 * Text Extraction Utilities
 * 
 * WHY: Pure functions for extracting patient information and metadata
 * from PDF text content. These utilities handle the parsing logic
 * without being tied to any specific service or class context.
 * 
 * FUNCTIONALITY:
 * - Extract patient names using various pattern matching strategies
 * - Parse test dates from different formats commonly found in lab reports
 * - Handle edge cases and provide fallback values
 * 
 * BENEFITS:
 * - Pure functions - easy to test and reason about
 * - Reusable across different parsing services
 * - No dependencies on external services or loggers
 */

import { Logger } from '@nestjs/common';

/**
 * Extract patient name from PDF text using pattern matching
 */
export function extractPatientName(text: string): string {
  const nameMatch = text.match(/Patient[Nn]ame[:\s]+([A-Z\s]+)/i) || 
                   text.match(/Name[:\s]+([A-Z\s]+)/i);
  return nameMatch ? nameMatch[1].trim() : 'Unknown Patient';
}

/**
 * Extract test date from PDF text supporting multiple date formats
 */
export function extractTestDate(text: string, logger?: Logger): string {
  // Look for various date formats from lab reports
  const datePatterns = [
    // Format: "31/07/2025" from hormone test PDFs
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
    // Format: "31-07-2025"
    /(\d{1,2}-\d{1,2}-\d{4})/,
    // Format: "2025-07-31" 
    /(\d{4}-\d{1,2}-\d{1,2})/,
    // Time format: "17:58:00 31/07/2025"
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
        logger?.warn(`Failed to parse date "${match[1]}": ${error.message}`);
        continue;
      }
    }
  }
  
  // Fallback to current date if no valid date found
  logger?.warn('No valid date found in PDF, using current date');
  return new Date().toISOString();
}
