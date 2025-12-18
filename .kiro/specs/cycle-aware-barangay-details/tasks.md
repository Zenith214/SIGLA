# Implementation Plan

- [x] 1. Lift cycle state management to MapView component





  - Modify MapView to manage `selectedCycleId` state
  - Add `handleCycleChange` callback function
  - Pass state and callback to MapCard component
  - _Requirements: 1.1, 1.2_

- [x] 1.1 Update MapView component state management


  - Add `useState` for `selectedCycleId` with type `number | null`
  - Implement `handleCycleChange` function to update state
  - _Requirements: 1.1, 1.2_

- [x] 1.2 Update MapCard component to use props


  - Modify MapCard interface to accept `selectedCycleId` and `onCycleChange` props
  - Remove local `selectedCycleId` state from MapCard
  - Pass `onCycleChange` to HistoricalCycleSelector
  - _Requirements: 1.1, 1.2_

- [x] 1.3 Pass selectedCycleId to BarangayDetailsCard


  - Update BarangayDetailsCard props interface to include `selectedCycleId`
  - Pass `selectedCycleId` from MapView to BarangayDetailsCard
  - _Requirements: 1.1, 1.2_

- [x] 2. Create or extend API endpoint for satisfaction data




  - Verify `/api/survey-analytics` supports cycle filtering
  - If needed, create new endpoint `/api/barangay-satisfaction`
  - Implement response format with satisfaction scores and service breakdown
  - Add error handling for missing data scenarios
  - _Requirements: 1.1, 1.4, 5.2_

- [x] 2.1 Verify existing API cycle support


  - Test `/api/survey-analytics` with `cycleId` parameter
  - Test `/api/ml/funnel-analysis` with `cycleId` parameter
  - Document which endpoint to use for satisfaction data
  - _Requirements: 1.1_

- [x] 2.2 Implement satisfaction data fetching logic


  - Create helper function to fetch satisfaction data by barangayId and cycleId
  - Handle null cycleId (use active cycle)
  - Parse and transform API response to match SatisfactionData interface
  - _Requirements: 1.1, 1.4_

- [x] 3. Implement data fetching in BarangayDetailsCard




  - Add state for satisfaction data, loading, and error
  - Implement useEffect to fetch data when barangay or cycle changes
  - Handle loading state with spinner
  - Handle error state with retry button
  - Handle "no data" state with appropriate message
  - _Requirements: 1.1, 1.2, 1.4, 5.1, 5.2, 5.3, 5.4_

- [x] 3.1 Add state management to BarangayDetailsCard


  - Add `satisfactionData` state with SatisfactionData type
  - Add `loading` boolean state
  - Add `error` string state
  - _Requirements: 5.1, 5.2_

- [x] 3.2 Implement data fetching useEffect


  - Create useEffect with dependencies on `selectedBarangay` and `selectedCycleId`
  - Fetch satisfaction data when either changes
  - Update loading state before and after fetch
  - Update error state on fetch failure
  - Update satisfactionData state on success
  - _Requirements: 1.1, 1.2, 5.1_

- [x] 3.3 Implement error handling and retry logic


  - Display error message when fetch fails
  - Add retry button that re-triggers fetch
  - Show cached data if available during error
  - _Requirements: 5.2, 5.3_

- [x] 4. Design and implement satisfaction data display UI





  - Create layout for overall satisfaction score with visual indicator
  - Implement color coding (green ≥70%, yellow 50-69%, red <50%)
  - Add cycle name and year display in card header
  - Add historical cycle badge when viewing past data
  - _Requirements: 1.5, 3.1, 3.2, 3.3_

- [x] 4.1 Implement overall satisfaction display


  - Add satisfaction score percentage display
  - Implement progress bar or circular indicator
  - Apply color coding based on score thresholds
  - _Requirements: 1.5, 3.2_

- [x] 4.2 Update card header with cycle information


  - Display selected cycle name and year
  - Add "Historical" badge for non-active cycles
  - Style active cycle differently from historical
  - _Requirements: 3.1, 3.3_

- [x] 5. Implement service area scores breakdown




  - Create compact layout for six service areas
  - Display score for each service area with color coding
  - Handle N/A or missing service area data
  - Add visual indicators (progress bars or icons)
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 5.1 Create service area score component


  - Build reusable component for displaying single service score
  - Include service name, percentage, and visual indicator
  - Apply color coding based on score
  - _Requirements: 2.1, 2.2_

- [x] 5.2 Implement service area grid layout

  - Arrange six service areas in compact grid
  - Ensure responsive layout for different screen sizes
  - Handle missing or N/A service data gracefully
  - _Requirements: 2.3, 2.4_

- [x] 6. Implement caching mechanism




  - Create in-memory cache using Map
  - Implement cache key generation (barangayId-cycleId)
  - Add cache expiration logic (5 minute TTL)
  - Implement LRU eviction when cache exceeds 50 entries
  - Check cache before fetching from API
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 6.1 Create cache utility module


  - Implement cache Map with typed keys and values
  - Create functions for get, set, and clear cache
  - Add timestamp tracking for expiration
  - _Requirements: 6.1, 6.2_

- [x] 6.2 Integrate cache with data fetching


  - Check cache before API call in useEffect
  - Store fetched data in cache after successful fetch
  - Return cached data if valid and not expired
  - _Requirements: 6.2, 6.3_

- [x] 6.3 Implement cache eviction logic


  - Track cache size and entry timestamps
  - Implement LRU eviction when size exceeds limit
  - Clear expired entries periodically
  - _Requirements: 6.3, 6.5_

- [x] 7. Maintain existing barangay information display





  - Ensure population, households, and area remain visible
  - Keep existing layout and styling
  - Display static info regardless of satisfaction data loading state
  - Maintain placeholder message when no barangay selected
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 8. Add loading and transition states





  - Implement loading spinner for satisfaction data
  - Add smooth transitions when switching cycles
  - Prevent layout shift during data loading
  - Show skeleton UI for satisfaction section while loading
  - _Requirements: 5.1, 5.3, 5.4_


- [x] 8.1 Create loading state UI

  - Add spinner or skeleton loader for satisfaction section
  - Keep static barangay info visible during loading
  - Show loading indicator in service area section
  - _Requirements: 5.1, 5.3_


- [x] 8.2 Implement smooth transitions

  - Add CSS transitions for data updates
  - Prevent jarring layout changes
  - Fade in new data smoothly
  - _Requirements: 4.4, 5.4_

- [x] 9. Handle edge cases and error scenarios





  - Display "No data available" when barangay has no data for selected cycle
  - Handle network errors with user-friendly messages
  - Implement timeout handling (10 second limit)
  - Add fallback to active cycle if invalid cycle selected
  - _Requirements: 1.4, 5.2, 5.3, 5.4, 5.5_


- [x] 9.1 Implement "no data" state

  - Detect when API returns empty or null data
  - Display appropriate message to user
  - Show static barangay info only
  - _Requirements: 1.4_



- [x] 9.2 Add network error handling





  - Catch fetch errors and display user-friendly message
  - Provide retry button
  - Log errors for debugging
  - _Requirements: 5.2, 5.5_

- [x] 10. Verify and test integration





  - Test cycle selection updates BarangayDetailsCard
  - Test barangay selection shows correct cycle data
  - Verify cache works correctly
  - Test error states and retry functionality
  - Verify responsive layout on mobile
  - Test with barangays that have no historical data
  - _Requirements: All_
