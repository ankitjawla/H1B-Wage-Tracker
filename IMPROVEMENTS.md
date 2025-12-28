# Code Improvement Suggestions

This document outlines comprehensive improvements for the H1B Wage Tracker codebase, organized by priority and category.

## 🔴 High Priority - Critical Issues

### 1. **Use Existing Refactored Components and Hooks**
**Issue**: The main `Map.jsx` file (445 lines) contains logic that has already been refactored into reusable components and hooks, but they're not being used.

**Files to refactor**:
- `src/hooks/useMapboxMap.js` - Already exists with proper error handling
- `src/hooks/useWageLevels.js` - Already exists with loading/error states
- `src/components/SalaryInput.jsx` - Already exists with validation
- `src/components/StatisticsPanel.jsx` - Already exists
- `src/components/Legend.jsx` - Already exists
- `src/components/ErrorBoundary.jsx` - Should wrap App.jsx

**Action**: Refactor `Map.jsx` to use these existing components and hooks.

### 2. **Add Error Boundary to App**
**Issue**: `ErrorBoundary.jsx` exists but is not used in `App.jsx`.

**Current**:
```jsx
// App.jsx
export default function App() {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Map />
      <Analytics />
    </div>
  );
}
```

**Should be**:
```jsx
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <div style={{ width: "100vw", height: "100vh" }}>
        <Map />
        <Analytics />
      </div>
    </ErrorBoundary>
  );
}
```

### 3. **Environment Variable Validation**
**Issue**: No validation that `VITE_MAPBOX_TOKEN` is set before using it.

**Current**: Direct access without validation
```jsx
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
```

**Solution**: Use existing `validateEnv()` from `src/utils/env.js` in `main.jsx` or `App.jsx`.

### 4. **Error Handling for API Calls**
**Issue**: No error handling for failed fetch requests in `Map.jsx`.

**Current**:
```jsx
const socRes = await fetch(`/data/soc/${selectedSoc}.json`);
if (!socRes.ok) return; // Silent failure
```

**Solution**: Use the existing `useWageLevels` hook which has proper error handling.

### 5. **Loading States**
**Issue**: No loading indicators when fetching wage data or initializing map.

**Solution**: Use loading states from `useMapboxMap` and `useWageLevels` hooks, and display `LoadingIndicator` component.

---

## 🟡 Medium Priority - Code Quality & Performance

### 6. **Debounce Salary Input**
**Issue**: Salary input triggers updates on every keystroke, causing unnecessary API calls.

**Solution**: Use existing `useDebounce` hook:
```jsx
const debouncedSalary = useDebounce(salary, 300);
useEffect(() => {
  updateLevels(soc, debouncedSalary);
}, [soc, debouncedSalary]);
```

### 7. **Use Constants from utils/constants.js**
**Issue**: Hardcoded values in `Map.jsx` that exist in constants file.

**Current**:
```jsx
const levelColors = {
  1: "#FEF3C7",
  2: "#F59E0B",
  // ...
};
```

**Solution**: Import from `src/utils/constants.js`:
```jsx
import { WAGE_LEVEL_COLORS, WAGE_LEVEL_NAMES, MAP_PAINT_COLORS } from "./utils/constants";
```

### 8. **Memoization for Expensive Calculations**
**Issue**: Wage level calculations run on every render.

**Solution**: Use `useMemo` for wage level calculations and `React.memo` for components:
```jsx
const wageLevels = useMemo(() => {
  return calculateWageLevels(counties, wageTable, hourly);
}, [counties, wageTable, hourly]);
```

### 9. **Extract Map Paint Property Logic**
**Issue**: Long paint property array hardcoded in component.

**Solution**: Create utility function:
```jsx
// utils/mapPaint.js
export function getWageLevelPaintExpression() {
  return [
    "case",
    ["==", ["get", "level"], 4], MAP_PAINT_COLORS[4],
    ["==", ["get", "level"], 3], MAP_PAINT_COLORS[3],
    ["==", ["get", "level"], 2], MAP_PAINT_COLORS[2],
    ["==", ["get", "level"], 1], MAP_PAINT_COLORS[1],
    MAP_PAINT_COLORS.default,
  ];
}
```

### 10. **URL State Management**
**Issue**: No way to share or bookmark specific occupation/salary combinations.

**Solution**: Use existing `useUrlState` hook (if it exists) or implement URL parameter syncing:
```jsx
// Shareable URLs like: ?soc=11-1011&salary=150000
```

### 11. **Component Size Reduction**
**Issue**: `Map.jsx` is 445 lines - too large for maintainability.

**Solution**: Break into smaller components:
- `ControlPanel.jsx` (already exists)
- `OccupationSelector.jsx` (already exists)
- Extract popup creation logic
- Extract statistics calculation

---

## 🟢 Low Priority - Enhancements

### 12. **Accessibility Improvements**
- Add ARIA labels to all interactive elements
- Improve keyboard navigation
- Add focus indicators
- Screen reader announcements for map updates

### 13. **Performance Optimizations**
- Lazy load county GeoJSON data
- Implement virtual scrolling for autocomplete (if many options)
- Cache wage data in IndexedDB
- Use Web Workers for heavy calculations

### 14. **User Experience Enhancements**
- Add toast notifications for errors/success
- Show progress bar during data loading
- Add "Copy to clipboard" for county details
- Add export functionality (CSV/JSON) for statistics

### 15. **Code Documentation**
- Add JSDoc comments to all exported functions
- Document component props with PropTypes or TypeScript
- Add inline comments for complex logic

### 16. **Testing**
- Add unit tests for utility functions (some exist)
- Add integration tests for Map component
- Add E2E tests for user workflows
- Test error scenarios

### 17. **Type Safety**
**Consideration**: Migrate to TypeScript for better type safety and developer experience.

### 18. **State Management**
**Consideration**: For complex state, consider using Context API or a state management library (Zustand, Redux).

### 19. **Code Splitting**
- Lazy load Map component
- Code split by route (if adding routes)
- Dynamic imports for heavy dependencies

### 20. **Security**
- Sanitize HTML in popups (XSS prevention) - partially done in useMapboxMap
- Validate all user inputs
- Implement CSP headers

---

## 📋 Specific Code Improvements

### Map.jsx Refactoring Example

**Before** (Current):
```jsx
// 445 lines with everything inline
export default function Map() {
  // All logic here
}
```

**After** (Recommended):
```jsx
import { useMapboxMap } from "./hooks/useMapboxMap";
import { useWageLevels } from "./hooks/useWageLevels";
import { useDebounce } from "./hooks/useDebounce";
import ControlPanel from "./components/ControlPanel";
import ErrorMessage from "./components/ErrorMessage";
import LoadingIndicator from "./components/LoadingIndicator";
import { validateEnv } from "./utils/env";

export default function Map() {
  // Validate environment on mount
  useEffect(() => {
    try {
      validateEnv();
    } catch (error) {
      console.error(error);
    }
  }, []);

  const { mapRef, countiesRef, mapLoading, mapError } = useMapboxMap(() => {
    // Initial update after map loads
    updateLevels(soc, salary);
  });

  const { updateLevels, stats, loading, error } = useWageLevels(mapRef, countiesRef);
  
  const [soc, setSoc] = useState("11-1011");
  const [salary, setSalary] = useState(150000);
  const debouncedSalary = useDebounce(salary, 300);

  useEffect(() => {
    if (mapRef.current && countiesRef.current) {
      updateLevels(soc, debouncedSalary);
    }
  }, [soc, debouncedSalary, updateLevels]);

  if (mapError) {
    return <ErrorMessage message={mapError} />;
  }

  return (
    <>
      <ControlPanel
        soc={soc}
        salary={salary}
        stats={stats}
        onSocChange={setSoc}
        onSalaryChange={setSalary}
        loading={loading}
      />
      {mapLoading && <LoadingIndicator />}
      <div id="map" />
    </>
  );
}
```

---

## 🔧 Quick Wins (Can be implemented immediately)

1. ✅ Wrap App with ErrorBoundary
2. ✅ Use existing SalaryInput component
3. ✅ Use existing StatisticsPanel component
4. ✅ Use existing Legend component
5. ✅ Import constants from utils/constants.js
6. ✅ Add debouncing to salary input
7. ✅ Add loading indicators
8. ✅ Use useWageLevels hook for error handling

---

## 📊 Metrics to Track

After implementing improvements, track:
- Bundle size reduction
- Initial load time
- Time to interactive
- Error rate
- User engagement metrics

---

## 🎯 Implementation Priority

1. **Week 1**: High priority items (1-5)
2. **Week 2**: Medium priority items (6-11)
3. **Week 3**: Low priority enhancements (12-20)

---

## 📝 Notes

- All suggested utilities, hooks, and components already exist in the codebase
- The main work is refactoring `Map.jsx` to use them
- This will significantly improve code maintainability, testability, and user experience
- Follows React best practices and modern patterns
