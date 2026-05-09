# Implementation Plan: Todo List Dashboard

## Overview

This implementation plan breaks down the Todo List Dashboard into discrete coding tasks. The dashboard is a single-page, client-side web application built with plain HTML, CSS, and Vanilla JavaScript. All logic resides in a single `js/app.js` file, all styling in `css/styles.css`, and all data is persisted via the browser's `localStorage` API.

The implementation follows a bottom-up approach: first establishing the project structure and shared utilities (StorageManager), then building each widget independently, and finally integrating all components into the main dashboard page.

## Tasks

- [x] 1. Set up project structure and StorageManager
  - [x] 1.1 Create project directory structure and HTML skeleton
    - Create `index.html` with semantic HTML structure for all four widgets
    - Create `css/` directory with `styles.css` file
    - Create `js/` directory with `app.js` file
    - Link CSS and JS files in `index.html`
    - _Requirements: TC-4, 12.3, 12.4_
  
  - [x] 1.2 Implement StorageManager module
    - Write `StorageManager` object with `KEYS`, `load(key)`, and `save(key, value)` methods
    - Implement JSON serialization/deserialization with error handling
    - Handle missing keys (return `null`), corrupt data (catch parse errors, return `null`), and quota exceeded errors
    - _Requirements: TC-2, 7.2, 7.5, 8.4_
  
  - [x]* 1.3 Write property test for StorageManager round-trip
    - **Property 19: StorageManager round-trip preserves data**
    - **Validates: Requirements 7.3, 8.4**
    - Test that `save` followed by `load` returns deeply equal data for both Task and Link arrays
    - Use fast-check with `fc.array(taskArb)` and `fc.array(linkArb)`, minimum 100 iterations
  
  - [x]* 1.4 Write unit tests for StorageManager edge cases
    - Test missing key returns `null`
    - Test corrupt JSON returns `null` without throwing
    - Test quota exceeded error is caught and logged
    - _Requirements: 7.5_

- [x] 2. Implement GreetingWidget
  - [x] 2.1 Implement time, date, and greeting formatting functions
    - Write `_formatTime(date)` to return HH:MM string (24-hour, zero-padded)
    - Write `_formatDate(date)` to return "Weekday, D Month YYYY" string
    - Write `_getGreeting(hour)` to return correct greeting for hour ranges (5-11: Morning, 12-17: Afternoon, 18-20: Evening, 21-4: Night)
    - Handle invalid dates with fallback values ("--:--", "Welcome")
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8_
  
  - [x]* 2.2 Write property tests for time and date formatting
    - **Property 1: Time formatting always produces HH:MM**
    - **Validates: Requirements 1.1**
    - Use `fc.date()`, verify output matches HH:MM pattern with correct values
    - **Property 2: Date formatting always produces the correct pattern**
    - **Validates: Requirements 1.3**
    - Use `fc.date()`, verify output matches "Weekday, D Month YYYY" pattern
    - **Property 3: Greeting is correct for all hours**
    - **Validates: Requirements 1.4, 1.5, 1.6, 1.7**
    - Use `fc.integer({ min: 0, max: 23 })`, verify correct greeting for each hour range
    - Minimum 100 iterations per property
  
  - [x]* 2.3 Write unit tests for GreetingWidget edge cases
    - Test invalid date returns "--:--" and "Welcome"
    - Test boundary hours (4, 5, 11, 12, 17, 18, 20, 21)
    - _Requirements: 1.8_
  
  - [x] 2.4 Implement GreetingWidget initialization and rendering
    - Write `GreetingWidget.init()` to bind DOM references and start interval
    - Write `_render()` to update time, date, and greeting text in the DOM
    - Set up `setInterval` with 60-second period, aligned to next minute boundary
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement FocusTimerWidget
  - [x] 3.1 Implement timer state management and formatting
    - Write `FocusTimerWidget` object with `_remaining`, `_intervalId`, `_isRunning` state
    - Write `_formatTime(seconds)` to return MM:SS string
    - Write `_start()`, `_stop()`, `_reset()`, and `_tick()` methods
    - Implement idempotency for `_start()` when already running and `_stop()` when already stopped
    - Handle completion at 00:00 (stop timer, apply CSS class, display "Session complete!")
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8_
  
  - [x]* 3.2 Write property tests for timer logic
    - **Property 4: Timer time formatting always produces MM:SS**
    - **Validates: Requirements 2.2, 2.3**
    - Use `fc.integer({ min: 0, max: 1500 })`, verify MM:SS pattern and correctness
    - **Property 5: Stop preserves remaining time**
    - **Validates: Requirements 2.4**
    - Use `fc.integer({ min: 1, max: 1500 })`, verify `_stop()` leaves `_remaining` unchanged
    - **Property 6: Reset always returns to 1500 seconds**
    - **Validates: Requirements 2.5**
    - Use `fc.record({ remaining: fc.integer({min:0,max:1500}), isRunning: fc.boolean() })`, verify reset behavior
    - **Property 7: Start is idempotent when already running**
    - **Validates: Requirements 2.7**
    - Use `fc.integer({ min: 1, max: 1500 })`, verify second `_start()` call has no effect
    - **Property 8: Stop is idempotent when already stopped**
    - **Validates: Requirements 2.8**
    - Use `fc.integer({ min: 0, max: 1500 })`, verify second `_stop()` call has no effect
    - Minimum 100 iterations per property
  
  - [x]* 3.3 Write unit tests for timer edge cases
    - Test completion at 00:00 applies CSS class and displays "Session complete!"
    - Test `_tick()` guard when `_remaining` is already 0
    - _Requirements: 2.6_
  
  - [-] 3.4 Implement FocusTimerWidget initialization and rendering
    - Write `FocusTimerWidget.init()` to bind DOM references and button event handlers
    - Write `_render()` to update timer display in the DOM
    - Wire Start, Stop, and Reset buttons to corresponding methods
    - _Requirements: 2.1, 2.2, 2.3_

- [~] 4. Checkpoint - Verify StorageManager and static widgets
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement TodoListWidget core logic
  - [ ] 5.1 Implement Task data model and state management
    - Define Task structure: `{ id, description, completed, createdAt }`
    - Write `TodoListWidget` object with `_tasks` array and `_editingId` state
    - Write `_loadFromStorage()` and `_saveToStorage()` methods using StorageManager
    - _Requirements: 3.1, 7.1, 7.2, 7.3_
  
  - [~] 5.2 Implement task addition and validation
    - Write `_addTask(description)` method
    - Trim input, reject empty/whitespace-only strings
    - Reject descriptions > 200 characters
    - Append new task with `completed: false` and current timestamp
    - Call `_saveToStorage()` after adding
    - _Requirements: 3.2, 3.3, 3.5, 7.1_
  
  - [x]* 5.3 Write property tests for task addition
    - **Property 9: Adding a valid task grows the list by one**
    - **Validates: Requirements 3.2**
    - Use `fc.array(taskArb)` and `fc.string({minLength:1,maxLength:200}).filter(s => s.trim().length > 0)`
    - **Property 10: Whitespace-only and empty task descriptions are rejected**
    - **Validates: Requirements 3.3**
    - Use `fc.array(taskArb)` and `fc.stringOf(fc.constantFrom(' ','\t','\n'))`
    - **Property 11: Task descriptions exceeding 200 characters are rejected**
    - **Validates: Requirements 3.5**
    - Use `fc.array(taskArb)` and `fc.string({minLength:201})`
    - Minimum 100 iterations per property
  
  - [~] 5.3 Implement task rendering and display order
    - Write `_render()` to re-render entire task list
    - Write `_renderTask(task)` to create DOM element for a single task
    - Ensure tasks are rendered in array order (first in array → first in DOM)
    - Display task description, completion checkbox, Edit button, Delete button
    - Apply strikethrough styling to completed tasks
    - _Requirements: 3.4, 5.2, 5.3_
  
  - [x]* 5.4 Write property test for task order preservation
    - **Property 12: Task list order is preserved in rendering**
    - **Validates: Requirements 3.4**
    - Use `fc.array(taskArb, {minLength:1})`, verify DOM order matches array order
    - Minimum 100 iterations

- [ ] 6. Implement TodoListWidget editing
  - [~] 6.1 Implement edit mode activation and cancellation
    - Write `_startEdit(id)` to replace task display with input field
    - Cancel any in-progress edit before opening new edit (at most one task in edit mode)
    - Write `_cancelEdit()` to restore original description and exit edit mode
    - _Requirements: 4.1, 4.2, 4.5, 4.6_
  
  - [~] 6.2 Implement edit confirmation and validation
    - Write `_confirmEdit(id, newDescription)` method
    - Trim new value, reject empty/whitespace-only (retain original description)
    - Update task description if valid, call `_saveToStorage()`
    - _Requirements: 4.3, 4.4, 7.1_
  
  - [x]* 6.3 Write property tests for edit logic
    - **Property 13: Edit confirmation trims and validates**
    - **Validates: Requirements 4.3, 4.4**
    - Use `taskArb` and `fc.string()`, verify trimming and rejection of empty values
    - **Property 14: Cancel edit always restores original description**
    - **Validates: Requirements 4.5**
    - Use `taskArb` and `fc.string()`, verify original description is restored
    - **Property 15: At most one task is in edit mode at any time**
    - **Validates: Requirements 4.6**
    - Use `fc.array(taskArb, {minLength:2})`, verify only one task in edit mode after `_startEdit`
    - Minimum 100 iterations per property

- [ ] 7. Implement TodoListWidget completion and deletion
  - [~] 7.1 Implement task completion toggle
    - Write `_toggleTask(id)` method
    - Toggle `completed` status, update strikethrough styling
    - Call `_saveToStorage()` after toggle
    - _Requirements: 5.1, 5.2, 5.3, 7.1_
  
  - [x]* 7.2 Write property test for toggle round-trip
    - **Property 16: Toggling completion is a round-trip**
    - **Validates: Requirements 5.2, 5.3**
    - Use `taskArb`, verify toggling twice returns to original state
    - Minimum 100 iterations
  
  - [~] 7.3 Implement task deletion with confirmation
    - Write `_deleteTask(id)` method
    - Display confirmation prompt (browser `confirm()` dialog)
    - Remove task from `_tasks` array if confirmed, call `_saveToStorage()`
    - Leave list unchanged if cancelled
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 7.1_
  
  - [x]* 7.4 Write property tests for deletion
    - **Property 17: Deleting a task reduces list length by one**
    - **Validates: Requirements 6.3**
    - Use `fc.array(taskArb, {minLength:1})`, verify list length decreases by 1
    - **Property 18: Cancelling deletion leaves the list unchanged**
    - **Validates: Requirements 6.4**
    - Use `fc.array(taskArb, {minLength:1})`, verify list is unchanged on cancel
    - Minimum 100 iterations per property

- [ ] 8. Implement TodoListWidget initialization and event handling
  - [~] 8.1 Implement TodoListWidget initialization
    - Write `TodoListWidget.init()` to bind DOM references
    - Call `_loadFromStorage()` to load tasks from localStorage
    - Call `_render()` to display initial task list
    - Handle missing or corrupt data (initialize with empty array)
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [~] 8.2 Implement event delegation for task list interactions
    - Write `_handleListClick(event)` for event delegation on task list container
    - Handle clicks on checkbox (toggle), Edit button (start edit), Delete button (delete), Save button (confirm edit), Cancel button (cancel edit)
    - Bind Add button and Enter key on input field to `_addTask`
    - _Requirements: 3.1, 3.2, 4.1, 4.2, 5.1, 6.1_

- [~] 9. Checkpoint - Verify TodoListWidget
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement QuickLinksWidget core logic
  - [~] 10.1 Implement Link data model and state management
    - Define Link structure: `{ id, label, url, createdAt }`
    - Write `QuickLinksWidget` object with `_links` array
    - Write `_loadFromStorage()` and `_saveToStorage()` methods using StorageManager
    - _Requirements: 8.4, 9.6, 10.3_
  
  - [~] 10.2 Implement link addition and validation
    - Write `_addLink(label, url)` method
    - Validate label is non-empty, URL is non-empty, URL starts with `http://` or `https://`
    - Write `_validateUrl(url)` helper function
    - Display inline error messages for validation failures
    - Append new link if valid, call `_saveToStorage()` within 300ms
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_
  
  - [x]* 10.3 Write property tests for link validation and addition
    - **Property 21: URL validation for opening links**
    - **Validates: Requirements 8.2, 8.3**
    - Use `fc.string()`, verify `_validateUrl` returns true for http/https URLs, false otherwise
    - **Property 22: Adding a valid link grows the list by one**
    - **Validates: Requirements 9.2**
    - Use `fc.array(linkArb)`, `fc.string({minLength:1})`, and valid URL arbitrary
    - **Property 23: Invalid link inputs are rejected**
    - **Validates: Requirements 9.3, 9.4, 9.5**
    - Use `fc.array(linkArb)` and invalid input combinations (empty label, empty URL, invalid URL)
    - Minimum 100 iterations per property
  
  - [~] 10.4 Implement link rendering and label truncation
    - Write `_render()` to re-render entire link panel
    - Write `_renderLink(link)` to create DOM element for a single link button
    - Truncate label to 50 characters in displayed button text
    - Display placeholder message ("No links saved yet") if `_links` is empty
    - _Requirements: 8.1, 8.5_
  
  - [x]* 10.5 Write property test for label truncation
    - **Property 20: Link label truncation**
    - **Validates: Requirements 8.1**
    - Use `fc.string()`, verify displayed text is at most 50 characters
    - Minimum 100 iterations

- [ ] 11. Implement QuickLinksWidget opening and deletion
  - [~] 11.1 Implement link opening with validation
    - Write `_openLink(url)` method
    - Validate URL starts with `http://` or `https://` before opening
    - Open valid URL in new tab with `window.open(url, '_blank')`
    - Display inline error message for invalid URLs
    - _Requirements: 8.2, 8.3_
  
  - [~] 11.2 Implement link deletion
    - Write `_deleteLink(id)` method
    - Remove link from `_links` array, call `_saveToStorage()` within 100ms
    - Re-render link panel
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [x]* 11.3 Write property test for link deletion
    - **Property 24: Deleting a link reduces list length by one**
    - **Validates: Requirements 10.2**
    - Use `fc.array(linkArb, {minLength:1})`, verify list length decreases by 1
    - Minimum 100 iterations

- [ ] 12. Implement QuickLinksWidget initialization and event handling
  - [~] 12.1 Implement QuickLinksWidget initialization
    - Write `QuickLinksWidget.init()` to bind DOM references
    - Call `_loadFromStorage()` to load links from localStorage
    - Call `_render()` to display initial link panel
    - Handle missing or corrupt data (initialize with empty array, show placeholder)
    - _Requirements: 8.4, 8.5_
  
  - [~] 12.2 Implement event delegation for link panel interactions
    - Write `_handlePanelClick(event)` for event delegation on link panel container
    - Handle clicks on link buttons (open link) and Delete buttons (delete link)
    - Bind Add Link button to `_addLink`
    - _Requirements: 8.2, 9.1, 10.1_

- [ ] 13. Implement CSS styling
  - [~] 13.1 Create base styles and layout
    - Write CSS reset and base typography (minimum 14px body font)
    - Define colour palette with 4.5:1 contrast ratio for text/background
    - Create grid or flexbox layout for four-widget dashboard
    - _Requirements: 12.1, 12.2, TC-4_
  
  - [~] 13.2 Style GreetingWidget
    - Style time, date, and greeting text with clear hierarchy
    - _Requirements: 1.1, 1.3, 1.4_
  
  - [~] 13.3 Style FocusTimerWidget
    - Style timer display (large, readable MM:SS)
    - Style Start, Stop, Reset buttons
    - Define completion state colour (red or green) for 00:00
    - _Requirements: 2.2, 2.6_
  
  - [~] 13.4 Style TodoListWidget
    - Style task list items (checkbox, description, Edit/Delete buttons)
    - Style strikethrough for completed tasks
    - Style edit mode input field
    - Style Add task input and button
    - _Requirements: 3.1, 3.4, 5.2_
  
  - [~] 13.5 Style QuickLinksWidget
    - Style link buttons (truncated labels, clear clickable area)
    - Style Add Link form (label input, URL input, Add button)
    - Style placeholder message for empty link list
    - Style inline error messages
    - _Requirements: 8.1, 9.1, 8.5_

- [ ] 14. Integrate all widgets and finalize dashboard
  - [~] 14.1 Wire all widgets in main initialization
    - Write main `DOMContentLoaded` event handler in `app.js`
    - Call `StorageManager.init()` (if needed)
    - Call `GreetingWidget.init()`, `FocusTimerWidget.init()`, `TodoListWidget.init()`, `QuickLinksWidget.init()`
    - Verify all widgets render correctly on page load
    - _Requirements: TC-1, TC-4, 11.1_
  
  - [~] 14.2 Verify performance requirements
    - Test dashboard loads and renders within 2 seconds with 100 tasks and 50 links
    - Test DOM updates occur within 100ms of user interactions
    - _Requirements: 11.1, 11.2_
  
  - [x]* 14.3 Write integration tests
    - Test dashboard loads and renders all four widgets
    - Test persisted data (tasks and links) loads correctly on reload
    - Test file structure (one CSS file at `css/styles.css`, one JS file at `js/app.js`)
    - Test font size ≥ 14px and colour contrast ≥ 4.5:1
    - _Requirements: TC-3, TC-4, 11.1, 11.2, 12.1, 12.2_

- [~] 15. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations per property
- All 24 correctness properties from the design document are covered by property test sub-tasks
- Unit tests complement property tests by covering specific edge cases and DOM interactions
- Integration tests verify end-to-end behavior and non-functional requirements
- StorageManager operations must complete within specified time limits (300ms for task/link add, 100ms for link delete)
- The single-file constraint (TC-4) means all widget logic is co-located in `js/app.js`, separated by comments and factory functions

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3", "1.4", "2.1"] },
    { "id": 3, "tasks": ["2.2", "2.3", "2.4", "3.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3"] },
    { "id": 6, "tasks": ["5.3", "5.4", "6.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "7.1"] },
    { "id": 8, "tasks": ["7.2", "7.3", "7.4", "8.1"] },
    { "id": 9, "tasks": ["8.2", "10.1"] },
    { "id": 10, "tasks": ["10.2", "10.3", "10.4", "10.5"] },
    { "id": 11, "tasks": ["11.1", "11.2", "11.3", "12.1"] },
    { "id": 12, "tasks": ["12.2", "13.1"] },
    { "id": 13, "tasks": ["13.2", "13.3", "13.4", "13.5"] },
    { "id": 14, "tasks": ["14.1"] },
    { "id": 15, "tasks": ["14.2", "14.3"] }
  ]
}
```
