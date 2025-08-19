/**
 * AI Recommendations Service - Generates intelligent health recommendations
 * 
 * WHY: Instead of hardcoded rules, this service uses AI to generate
 * personalized, contextual recommendations based on the actual bloodwork
 * results and medical knowledge. This provides much more valuable insights
 * than simple rule-based recommendations.
 * 
 * FUNCTIONALITY:
 * - Analyzes complete bloodwork context using AI
 * - Generates personalized recommendations based on specific values
 * - Considers interactions between multiple test results
 * - Provides actionable, medically-informed advice
 * - Maintains medical disclaimers and safety guidelines
 * 
 * FUTURE AI INTEGRATION:
 * Currently uses mock responses, but designed for easy OpenAI/medical AI integration
 */

import { Injectable } from '@nestjs/common';
import { TestResult } from '../common/entities/bloodwork-result.entity';

export interface AiRecommendationRequest {
  testResults: TestResult[];
  testType: string;
  testDate: string;
  patientContext?: {
    age?: number;
    gender?: 'M' | 'F';
    medicalHistory?: string[];
    medications?: string[];
  };
}

export interface AiRecommendationResponse {
  recommendations: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  followUpTimeframe: string;
  medicalDisclaimer: string;
  keyFindings: string[];
}

@Injectable()
export class AiRecommendationsService {
  
  /**
   * Generates AI-powered recommendations for bloodwork results
   * 
   * WHY: This is where the real medical intelligence happens. Instead of
   * simple if/then rules, AI can understand complex interactions between
   * test values and provide nuanced, personalized recommendations.
   * 
   * AI CAPABILITIES:
   * - Understands medical context and relationships
   * - Considers multiple abnormal values together
   * - Provides personalized advice based on specific patterns
   * - Generates actionable next steps
   * - Maintains appropriate medical caution
   */
  async generateRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationResponse> {
    // TODO: Replace with real AI service call when ready
    return this.generateMockAiRecommendations(request);
  }

  /**
   * Mock AI recommendations - realistic simulation for development
   * 
   * WHY: Provides realistic AI-style recommendations while you're building.
   * When ready for real AI, just replace this method with actual API calls.
   * 
   * DESIGNED FOR EASY AI REPLACEMENT:
   * - Same input/output structure as real AI service
   * - Contextual analysis like real AI would provide
   * - Medical-grade language and safety considerations
   */
  private async generateMockAiRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationResponse> {
    const { testResults, testType, testDate } = request;
    
    // Analyze the bloodwork context
    const analysis = this.analyzeBloodworkContext(testResults);
    
    // Generate contextual recommendations based on findings
    const recommendations = this.generateContextualRecommendations(analysis, testResults);
    
    // Determine severity and follow-up timing
    const severity = this.determineSeverity(testResults);
    const followUpTimeframe = this.determineFollowUpTiming(severity, testResults);
    
    // Generate key findings summary
    const keyFindings = this.generateKeyFindings(analysis, testResults);

    return {
      recommendations,
      severity,
      followUpTimeframe,
      medicalDisclaimer: this.getMedicalDisclaimer(),
      keyFindings,
    };
  }

  /**
   * Analyzes bloodwork context for intelligent recommendations
   * 
   * WHY: Real AI would analyze patterns, relationships, and context.
   * This simulation provides similar contextual analysis that considers
   * multiple factors together rather than isolated test values.
   */
  private analyzeBloodworkContext(testResults: TestResult[]): {
    criticalFindings: TestResult[];
    abnormalFindings: TestResult[];
    systemsAffected: string[];
    riskFactors: string[];
    positiveFindings: TestResult[];
  } {
    const criticalFindings = testResults.filter(test => test.status === 'critical');
    const abnormalFindings = testResults.filter(test => test.status === 'high' || test.status === 'low');
    const positiveFindings = testResults.filter(test => test.status === 'normal');

    // Identify affected body systems based on test patterns
    const systemsAffected = this.identifyAffectedSystems(testResults);
    
    // Identify risk factors based on abnormal patterns
    const riskFactors = this.identifyRiskFactors(abnormalFindings);

    return {
      criticalFindings,
      abnormalFindings,
      systemsAffected,
      riskFactors,
      positiveFindings,
    };
  }

  /**
   * Generates intelligent, contextual recommendations
   * 
   * WHY: This simulates how AI would provide nuanced advice based on
   * the complete picture rather than individual test rules. Real AI
   * would consider medical knowledge, drug interactions, and patterns.
   */
  private generateContextualRecommendations(analysis: any, testResults: TestResult[]): string[] {
    const recommendations: string[] = [];

    // Critical findings require immediate attention
    if (analysis.criticalFindings.length > 0) {
      recommendations.push(
        `🚨 URGENT: ${analysis.criticalFindings.length} critical result${analysis.criticalFindings.length > 1 ? 's' : ''} require immediate medical evaluation. Contact your healthcare provider today.`
      );
      
      // Specific critical recommendations
      analysis.criticalFindings.forEach((test: TestResult) => {
        const criticalAdvice = this.getCriticalTestAdvice(test);
        if (criticalAdvice) recommendations.push(criticalAdvice);
      });
    }

    // System-specific recommendations based on affected areas
    analysis.systemsAffected.forEach((system: string) => {
      const systemAdvice = this.getSystemSpecificAdvice(system, analysis.abnormalFindings);
      if (systemAdvice) recommendations.push(systemAdvice);
    });

    // Risk factor mitigation
    analysis.riskFactors.forEach((risk: string) => {
      const riskAdvice = this.getRiskMitigationAdvice(risk);
      if (riskAdvice) recommendations.push(riskAdvice);
    });

    // Positive reinforcement for normal results
    if (analysis.positiveFindings.length > 0 && analysis.criticalFindings.length === 0) {
      recommendations.push(
        `✅ ${analysis.positiveFindings.length} test${analysis.positiveFindings.length > 1 ? 's' : ''} within normal range - continue current health practices.`
      );
    }

    // General wellness recommendations
    recommendations.push(...this.getGeneralWellnessAdvice(analysis));

    return recommendations;
  }

  /**
   * Identifies affected body systems from test patterns
   * 
   * WHY: Real medical AI would recognize that certain test combinations
   * indicate problems with specific organ systems (liver, kidney, heart, etc.)
   */
  private identifyAffectedSystems(testResults: TestResult[]): string[] {
    const systems: string[] = [];
    
    // Liver function indicators
    const liverTests = testResults.filter(test => 
      test.testName.toLowerCase().includes('alt') ||
      test.testName.toLowerCase().includes('ast') ||
      test.testName.toLowerCase().includes('bilirubin')
    );
    if (liverTests.some(test => test.status !== 'normal')) {
      systems.push('liver');
    }

    // Kidney function indicators
    const kidneyTests = testResults.filter(test => 
      test.testName.toLowerCase().includes('creatinine') ||
      test.testName.toLowerCase().includes('bun') ||
      test.testName.toLowerCase().includes('egfr')
    );
    if (kidneyTests.some(test => test.status !== 'normal')) {
      systems.push('kidney');
    }

    // Cardiovascular indicators
    const cardioTests = testResults.filter(test => 
      test.testName.toLowerCase().includes('cholesterol') ||
      test.testName.toLowerCase().includes('triglyceride') ||
      test.testName.toLowerCase().includes('hdl') ||
      test.testName.toLowerCase().includes('ldl')
    );
    if (cardioTests.some(test => test.status !== 'normal')) {
      systems.push('cardiovascular');
    }

    // Metabolic indicators
    const metabolicTests = testResults.filter(test => 
      test.testName.toLowerCase().includes('glucose') ||
      test.testName.toLowerCase().includes('hba1c') ||
      test.testName.toLowerCase().includes('insulin')
    );
    if (metabolicTests.some(test => test.status !== 'normal')) {
      systems.push('metabolic');
    }

    return systems;
  }

  /**
   * System-specific advice based on affected organ systems
   * 
   * WHY: Real AI would provide targeted advice for specific organ systems
   * rather than generic recommendations. This provides more actionable guidance.
   */
  private getSystemSpecificAdvice(system: string, abnormalTests: TestResult[]): string | null {
    const systemAdvice: Record<string, string> = {
      liver: '🫀 Liver function markers elevated - consider reducing alcohol intake, avoiding hepatotoxic medications, and discussing liver health with your doctor.',
      kidney: '🔄 Kidney function indicators abnormal - ensure adequate hydration, monitor blood pressure, and consider nephrology consultation.',
      cardiovascular: '❤️ Cardiovascular risk factors detected - focus on heart-healthy diet, regular exercise, and lipid management strategies.',
      metabolic: '⚡ Metabolic markers suggest monitoring blood sugar - consider dietary modifications, regular glucose monitoring, and endocrinology evaluation.',
    };

    return systemAdvice[system] || null;
  }

  /**
   * Generates key findings summary for user understanding
   * 
   * WHY: Helps users quickly understand the most important aspects
   * of their results without getting overwhelmed by technical details.
   */
  private generateKeyFindings(analysis: any, testResults: TestResult[]): string[] {
    const findings: string[] = [];

    if (analysis.criticalFindings.length > 0) {
      findings.push(`${analysis.criticalFindings.length} critical result(s) requiring urgent attention`);
    }

    if (analysis.abnormalFindings.length > 0) {
      findings.push(`${analysis.abnormalFindings.length} result(s) outside normal range`);
    }

    if (analysis.systemsAffected.length > 0) {
      findings.push(`Potential concerns with: ${analysis.systemsAffected.join(', ')} function`);
    }

    if (analysis.positiveFindings.length > 0) {
      findings.push(`${analysis.positiveFindings.length} result(s) within healthy range`);
    }

    return findings;
  }

  /**
   * Additional helper methods for comprehensive AI simulation
   */
  private identifyRiskFactors(abnormalTests: TestResult[]): string[] {
    const risks: string[] = [];
    
    // Cardiovascular risk
    if (abnormalTests.some(test => test.testName.toLowerCase().includes('cholesterol'))) {
      risks.push('cardiovascular disease');
    }
    
    // Diabetes risk
    if (abnormalTests.some(test => test.testName.toLowerCase().includes('glucose'))) {
      risks.push('diabetes mellitus');
    }
    
    // Liver disease risk
    if (abnormalTests.some(test => test.testName.toLowerCase().includes('alt'))) {
      risks.push('liver dysfunction');
    }

    return risks;
  }

  private getCriticalTestAdvice(test: TestResult): string | null {
    // Provide specific critical advice based on test type
    const testName = test.testName.toLowerCase();
    
    if (testName.includes('glucose') && test.status === 'critical') {
      return '🩸 Critical glucose levels detected - seek immediate medical attention for blood sugar management.';
    }
    
    if (testName.includes('creatinine') && test.status === 'critical') {
      return '🚰 Critical kidney function markers - urgent nephrology consultation recommended.';
    }
    
    return `⚠️ Critical ${test.testName} level (${test.value} ${test.unit}) requires immediate medical evaluation.`;
  }

  private getRiskMitigationAdvice(risk: string): string | null {
    const advice: Record<string, string> = {
      'cardiovascular disease': '🏃‍♂️ Focus on heart-healthy lifestyle: regular exercise, Mediterranean diet, stress management.',
      'diabetes mellitus': '🥗 Prioritize blood sugar management: low-glycemic diet, regular monitoring, weight management.',
      'liver dysfunction': '🚫 Support liver health: avoid alcohol, limit processed foods, maintain healthy weight.',
    };

    return advice[risk] || null;
  }

  private getGeneralWellnessAdvice(analysis: any): string[] {
    const advice: string[] = [];
    
    advice.push('💊 Continue taking prescribed medications as directed by your healthcare provider.');
    advice.push('📋 Keep a copy of these results for your medical records and future reference.');
    
    if (analysis.abnormalFindings.length > 0) {
      advice.push('🔄 Consider retesting in 3-6 months to monitor changes and treatment effectiveness.');
    } else {
      advice.push('📅 Schedule routine follow-up testing in 12 months for continued health monitoring.');
    }

    return advice;
  }

  private determineSeverity(testResults: TestResult[]): 'low' | 'medium' | 'high' | 'critical' {
    if (testResults.some(test => test.status === 'critical')) return 'critical';
    
    const abnormalCount = testResults.filter(test => test.status !== 'normal').length;
    const totalCount = testResults.length;
    const abnormalPercentage = (abnormalCount / totalCount) * 100;

    if (abnormalPercentage > 50) return 'high';
    if (abnormalPercentage > 25) return 'medium';
    return 'low';
  }

  private determineFollowUpTiming(severity: string, testResults: TestResult[]): string {
    switch (severity) {
      case 'critical': return 'Immediate medical attention required';
      case 'high': return 'Follow-up within 1-2 weeks';
      case 'medium': return 'Follow-up within 1 month';
      default: return 'Routine follow-up in 3-6 months';
    }
  }

  private getMedicalDisclaimer(): string {
    return 'This analysis is for informational purposes only and does not constitute medical advice. Always consult with qualified healthcare professionals for medical decisions and treatment plans.';
  }

  /**
   * FUTURE: Real AI Integration Method
   * 
   * WHY: When you're ready for real AI, replace the mock method above
   * with this structure. The same input/output format ensures your
   * React Native app continues working without changes.
   */
  /*
  private async callRealAiForRecommendations(request: AiRecommendationRequest): Promise<AiRecommendationResponse> {
    const prompt = this.buildMedicalAnalysisPrompt(request);
    
    const aiResponse = await this.openAiService.createCompletion({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a medical AI assistant specializing in bloodwork analysis. Provide safe, evidence-based recommendations while emphasizing the need for professional medical consultation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3, // Lower temperature for more consistent medical advice
    });

    return this.parseAiResponse(aiResponse.choices[0].message.content);
  }

  private buildMedicalAnalysisPrompt(request: AiRecommendationRequest): string {
    return `
      Analyze the following bloodwork results and provide personalized health recommendations:

      Test Type: ${request.testType}
      Test Date: ${request.testDate}
      
      Results:
      ${request.testResults.map(test => 
        `- ${test.testName}: ${test.value} ${test.unit} (Reference: ${test.referenceRange.min}-${test.referenceRange.max} ${test.unit}) [Status: ${test.status}]`
      ).join('\n')}

      ${request.patientContext ? `
      Patient Context:
      - Age: ${request.patientContext.age || 'Not provided'}
      - Gender: ${request.patientContext.gender || 'Not provided'}
      - Medical History: ${request.patientContext.medicalHistory?.join(', ') || 'Not provided'}
      - Current Medications: ${request.patientContext.medications?.join(', ') || 'Not provided'}
      ` : ''}

      Please provide:
      1. Key findings and their significance
      2. Specific, actionable recommendations
      3. Lifestyle modifications if appropriate
      4. Follow-up recommendations
      5. When to seek medical attention
      6. Overall risk assessment

      Include appropriate medical disclaimers and emphasize the importance of professional medical consultation.
    `;
  }
  */
}
