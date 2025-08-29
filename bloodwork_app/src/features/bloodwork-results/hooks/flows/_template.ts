/**
 * 🧩 CUSTOM HOOK TEMPLATE - Copy this pattern for new flow hooks
 * 
 * ✅ PROVEN PATTERN: This template follows the validated useUploadFlow approach
 * 
 * 🛡️ PERFORMANCE GUARDRAILS:
 * - Selective subscriptions only (no bare useBloodworkStore())
 * - Memoized computed values (no fresh objects each render)  
 * - Stable action references (Zustand actions are stable)
 * - Clear ownership boundaries (single responsibility)
 * 
 * 📋 USAGE:
 * 1. Copy this file to your new hook name (e.g., use-analysis-flow.ts)
 * 2. Replace TEMPLATE with your domain (e.g., Analysis)
 * 3. Update state selectors for your specific needs
 * 4. Add relevant computed values
 * 5. Test with performance monitoring
 */

import { useMemo } from 'react';
import { useBloodworkStore } from '../../store/use-bloodwork-store';

/**
 * TEMPLATE flow hook with strict performance guardrails
 * 
 * ✅ SAFE TIER 2 IMPLEMENTATION:
 * - Selective subscriptions (preserves Tier 1 gains)
 * - Memoized computed values (no fresh objects)
 * - Stable action references (Zustand actions are stable)
 * - Clear ownership boundaries (TEMPLATE-only concerns)
 */
export const useTEMPLATEFlow = () => {
  // ✅ Subscribe to only what the TEMPLATE UI actually renders
  // TODO: Replace these with your specific state needs
  const step = useBloodworkStore(s => s.step);
  const someValue = useBloodworkStore(s => s.someValue);
  const error = useBloodworkStore(s => s.error);

  // ✅ Actions are stable in Zustand - no need for additional optimization
  // TODO: Add only the actions this hook needs to manage
  const setStep = useBloodworkStore(s => s.setStep);
  const setSomeValue = useBloodworkStore(s => s.setSomeValue);
  const setError = useBloodworkStore(s => s.setError);

  // ✅ Computed values memoized (no fresh objects each render)
  // TODO: Add domain-specific computed values
  const computed = useMemo(() => ({
    hasSomeValue: !!someValue,
    hasError: !!error,
    isSpecificStep: step === 'specific-value',
    // Add more computed values as needed
  }), [someValue, error, step]);

  // Return only what consumers need; avoid dumping the whole store
  return { 
    step, 
    someValue, 
    error,
    setStep,
    setSomeValue,
    setError,
    ...computed 
  };
};

/* 
📋 IMPLEMENTATION CHECKLIST:

□ Updated hook name (useTEMPLATEFlow → useYourFlow)
□ Updated state selectors for your domain
□ Updated action selectors for your domain  
□ Updated computed values for your domain
□ Added performance monitoring to consuming component
□ Tested that unrelated state changes don't trigger re-renders
□ Verified that only relevant state changes trigger re-renders
□ Added JSDoc documentation for the hook's purpose

🎯 PERFORMANCE VALIDATION:
1. Add render monitoring: useEffect(() => console.log('🔄 Component render'))
2. Test unrelated updates (filters, other state) - should not re-render
3. Test relevant updates (your domain state) - should re-render
4. Use React DevTools Profiler to compare vs bare store subscriptions

⚠️ DANGER ZONES TO AVOID:
❌ useBloodworkStore() with no selector
❌ Returning new objects without useMemo
❌ Conditional hook calls inside the custom hook
❌ Managing state outside your domain boundaries
*/
