# 🧩 Future Custom Hooks Blueprints

These blueprints follow the proven `useUploadFlow` pattern for safe, performant implementations.

## 🎯 Implementation Strategy

**Opportunistic Expansion**: Add these hooks only when touching adjacent screens, not all at once.

**Guardrails**: Each hook must follow the template pattern with performance monitoring.

---

## 📋 useAnalysisFlow (AnalysisProgress Component)

**Purpose**: Manages analysis job monitoring and state transitions

**State (read)**:
- `step` - Current analysis step
- `jobId` - Active analysis job ID
- `error` - Analysis errors

**Actions (write)**:
- `setStep` - Transition analysis states
- `setResultId` - Set completed result ID
- `setError` - Set analysis errors
- `resetFlow` - Reset analysis state

**Computed**:
- `isAnalyzing` - Is currently analyzing
- `hasJobId` - Has active job
- `hasError` - Has analysis error

```typescript
import { useMemo } from 'react';
import { useBloodworkStore } from '../../store/use-bloodwork-store';

export const useAnalysisFlow = () => {
  // State subscriptions
  const step = useBloodworkStore(s => s.step);
  const jobId = useBloodworkStore(s => s.jobId);
  const error = useBloodworkStore(s => s.error);
  
  // Actions
  const setStep = useBloodworkStore(s => s.setStep);
  const setResultId = useBloodworkStore(s => s.setResultId);
  const setError = useBloodworkStore(s => s.setError);
  const resetFlow = useBloodworkStore(s => s.resetFlow);
  
  // Computed values
  const computed = useMemo(() => ({
    isAnalyzing: step === 'analyzing',
    hasJobId: !!jobId,
    hasError: !!error,
  }), [step, jobId, error]);
  
  return { 
    step, 
    jobId, 
    error,
    setStep, 
    setResultId, 
    setError, 
    resetFlow, 
    ...computed 
  };
};
```

---

## 📊 useResultFlow (ResultSummary Component)

**Purpose**: Manages result display and navigation

**State (read)**:
- `resultId` - Current result ID

**Actions (write)**:
- Minimal - this component is mostly read-only

**Computed**:
- `hasResult` - Has valid result ID

```typescript
import { useMemo } from 'react';
import { useBloodworkStore } from '../../store/use-bloodwork-store';

export const useResultFlow = () => {
  // State subscriptions
  const resultId = useBloodworkStore(s => s.resultId);
  
  // Computed values
  const computed = useMemo(() => ({
    hasResult: !!resultId,
  }), [resultId]);
  
  return { 
    resultId,
    ...computed 
  };
};
```

---

## 📝 useBloodworkList (List/Filters Component)

**Purpose**: Manages result filtering and list state

**State (read)**:
- `filters` - Current filter state
- `selectedResultId` - Selected result for navigation

**Actions (write)**:
- `setFilters` - Update filter criteria
- `clearFilters` - Reset filters
- `setSelectedResultId` - Select result for detail view

**Computed**:
- `hasFilters` - Has active filters
- `hasSelection` - Has selected result

```typescript
import { useMemo } from 'react';
import { useBloodworkStore } from '../../store/use-bloodwork-store';

export const useBloodworkList = () => {
  // State subscriptions
  const filters = useBloodworkStore(s => s.filters);
  const selectedResultId = useBloodworkStore(s => s.selectedResultId);
  
  // Actions
  const setFilters = useBloodworkStore(s => s.setFilters);
  const clearFilters = useBloodworkStore(s => s.clearFilters);
  const setSelectedResultId = useBloodworkStore(s => s.setSelectedResultId);
  
  // Computed values
  const computed = useMemo(() => ({
    hasFilters: !!(filters.dateRange || filters.testType || filters.status),
    hasSelection: !!selectedResultId,
  }), [filters, selectedResultId]);
  
  return { 
    filters,
    selectedResultId,
    setFilters, 
    clearFilters,
    setSelectedResultId,
    ...computed 
  };
};
```

---

## 🛡️ Implementation Guardrails

### Before Adding Any Hook:

1. **Copy from template**: Use `_template.ts` as starting point
2. **Performance monitoring**: Add render logging to component
3. **Clear ownership**: Hook manages only its domain
4. **Test isolation**: Verify unrelated state changes don't trigger re-renders

### After Implementation:

1. **Profile performance**: Compare before/after with React DevTools
2. **Validate scope**: Ensure hook doesn't manage other domains
3. **Document usage**: Update component with clean hook usage
4. **Remove monitoring**: Clean up console logs after validation

### Red Flags:

❌ **Multiple domains in one hook** (upload + analysis + results)  
❌ **Bare store subscriptions** (`useBloodworkStore()` without selector)  
❌ **Fresh objects each render** (missing `useMemo`)  
❌ **Conditional hooks** (hooks inside if statements)  

---

## 🎯 Success Metrics

- **Performance preserved**: Same or fewer re-renders vs selective subscriptions
- **Code clarity**: Component logic simplified with domain-specific API
- **Maintainability**: Clear boundaries between hook responsibilities
- **Reusability**: Hook can be used across multiple components if needed

---

## 🔮 Future Considerations

### Dynamic Polling Enhancement:
When adding `useAnalysisFlow`, consider integrating with `useAnalysisJob` for smart polling based on analysis state.

### Analytics Integration:
Use `subscribeWithSelector` for analytics on state transitions without affecting UI performance.

### Store Slicing:
If store grows significantly, consider splitting into domain-specific stores with these hooks as the interface layer.
