# Requirements Document

## Introduction

The Todo List Dashboard is a client-side web application built with HTML, CSS, and Vanilla JavaScript. It provides a clean, minimal personal productivity dashboard that runs entirely in the browser with no backend server. The dashboard combines four core widgets: a time/date greeting, a focus timer, a to-do list, and a quick links panel. All user data is persisted using the browser's Local Storage API, making the app usable as a standalone web page or browser extension.

## Glossary

- **Dashboard**: The single-page web application containing all four widgets.
- **Greeting_Widget**: The UI component that displays the current time, date, and a time-based greeting message.
- **Focus_Timer**: The UI component that implements a 25-minute countdown timer with Start, Stop, and Reset controls.
- **Todo_List**: The UI component that manages a collection of task items.
- **Task**: A single to-do item with a text description and a completion status.
- **Quick_Links**: The UI component that displays a set of user-defined shortcut buttons that open URLs in the browser.
- **Link**: A single quick-link entry consisting of a label and a URL.
- **Storage_Manager**: The module responsible for reading and writing all persistent data to the browser's Local Storage API.
- **Local_Storage**: The browser's built-in `localStorage` API used for client-side data persistence.

---

## Technical Constraints

- **TC-1 — Technology Stack**: THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript. No JavaScript frameworks (React, Vue, Angular, etc.) or build tools are permitted.
- **TC-2 — Data Storage**: THE Storage_Manager SHALL use the browser Local Storage API as the sole persistence mechanism. No backend server or external database is required.
- **TC-3 — Browser Compatibility**: THE Dashboard SHALL function correctly in current stable versions of Chrome, Firefox, Edge, and Safari.
- **TC-4 — File Structure**: THE Dashboard SHALL contain exactly one CSS file inside a `css/` directory and exactly one JavaScript file inside a `js/` directory.

---

## Requirements

### Requirement 1: Time, Date, and Greeting Display

**User Story:** As a user, I want to see the current time, date, and a contextual greeting when I open the dashboard, so that I have an immediate sense of the time of day without checking another app.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Greeting_Widget SHALL display the current local time in HH:MM (24-hour) format.
2. WHEN the system clock advances to a new minute, THE Greeting_Widget SHALL update the displayed time to reflect the new HH:MM value.
3. WHEN the Dashboard loads, THE Greeting_Widget SHALL display the current full date in the format "Weekday, D Month YYYY" (e.g., "Monday, 5 May 2025").
4. WHEN the local time is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
5. WHEN the local time is between 12:00 and 17:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
6. WHEN the local time is between 18:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
7. WHEN the local time is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
8. IF the system clock is unavailable or returns an invalid value, THEN THE Greeting_Widget SHALL display a fallback message (e.g., "Welcome") in place of the time-based greeting and SHALL display "--:--" in place of the time.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute countdown timer with Start, Stop, and Reset controls, so that I can use the Pomodoro technique to manage focused work sessions.

#### Acceptance Criteria

1. WHEN the Dashboard loads, THE Focus_Timer SHALL display a countdown value of 25:00 (25 minutes, 00 seconds).
2. WHEN the user activates the Start control and the timer is not already counting down, THE Focus_Timer SHALL begin (or resume) counting down one second at a time, displaying the remaining time in MM:SS format.
3. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL update the displayed MM:SS value once per second.
4. WHEN the user activates the Stop control and the timer is counting down, THE Focus_Timer SHALL pause the countdown and retain the current remaining time in the display.
5. WHEN the user activates the Reset control, THE Focus_Timer SHALL stop any active countdown and reset the displayed time to 25:00.
6. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically, change the timer display text colour to a visually distinct colour (e.g., red or green as defined in the CSS), and display the static text "Session complete!" beneath the timer display.
7. WHEN the user activates the Reset control after the countdown has reached 00:00, THE Focus_Timer SHALL reset the displayed time to 25:00, restore the timer display text colour to its default colour, and remove the "Session complete!" message.
8. WHEN the user activates the Start control and the timer is already counting down, THE Focus_Timer SHALL ignore the activation and continue counting down unchanged.
9. WHEN the user activates the Stop control and the timer is not counting down, THE Focus_Timer SHALL ignore the activation.

---

### Requirement 3: To-Do List — Add and Display Tasks

**User Story:** As a user, I want to add tasks to a list and see them displayed on the dashboard, so that I can track what I need to accomplish.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a text input field and an "Add" control for creating new tasks.
2. WHEN the user submits a non-empty task description via the Add control or by pressing the Enter key, THE Todo_List SHALL append the new Task to the list with a completion status of incomplete, and SHALL clear the text input field.
3. IF the user attempts to submit an empty or whitespace-only task description, THEN THE Todo_List SHALL not add the Task and SHALL retain focus on the input field.
4. THE Todo_List SHALL display all tasks in the order they were added, showing each task's description and a visual indicator of its completion status (e.g., a checkbox).
5. THE Todo_List SHALL not accept a task description longer than 200 characters; IF the user attempts to submit a description exceeding 200 characters, THEN THE Todo_List SHALL not add the Task and SHALL display an inline error message indicating the character limit has been exceeded; WHEN the user modifies the input field content to 200 characters or fewer, THE Todo_List SHALL remove the error message.

---

### Requirement 4: To-Do List — Edit Tasks

**User Story:** As a user, I want to edit the text of an existing task, so that I can correct mistakes or update task descriptions without deleting and re-adding them.

#### Acceptance Criteria

1. THE Todo_List SHALL provide an Edit control for each Task in the list.
2. WHEN the user activates the Edit control for a Task, THE Todo_List SHALL replace the task's display text with an editable input field pre-filled with the current task description, and SHALL move focus to that input field.
3. WHEN the user confirms the edit (by pressing Enter or activating a Save control), THE Todo_List SHALL trim leading and trailing whitespace from the new value; IF the trimmed value is non-empty, THEN THE Todo_List SHALL update the Task's description to the trimmed value and return to display mode.
4. IF the user confirms an edit with an empty or whitespace-only value, THEN THE Todo_List SHALL not update the Task and SHALL retain the original description in the edit input field.
5. WHEN the user cancels the edit (by pressing Escape), THE Todo_List SHALL discard the changes and return the Task to display mode with the original description.
6. WHILE a Task is in edit mode, THE Todo_List SHALL not allow another Task to enter edit mode simultaneously; activating the Edit control on a second Task SHALL first cancel the in-progress edit (as if Escape were pressed) before opening the new edit.

---

### Requirement 5: To-Do List — Mark Tasks as Done

**User Story:** As a user, I want to mark tasks as complete or incomplete, so that I can track my progress through the list.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a checkbox control for each Task to indicate and toggle its completion status.
2. WHEN the user activates the checkbox for an incomplete Task, THE Todo_List SHALL update the Task's completion status to complete and SHALL apply strikethrough styling to the task description text.
3. WHEN the user activates the checkbox for a complete Task, THE Todo_List SHALL update the Task's completion status to incomplete and SHALL remove the strikethrough styling from the task description text.

---

### Requirement 6: To-Do List — Delete Tasks

**User Story:** As a user, I want to delete tasks from the list, so that I can remove items that are no longer relevant.

#### Acceptance Criteria

1. THE Todo_List SHALL provide a Delete control for each Task in the list.
2. WHEN the user activates the Delete control for a Task, THE Todo_List SHALL display a confirmation prompt (e.g., a browser `confirm()` dialog or an inline confirmation UI) asking the user to confirm the deletion.
3. WHEN the user confirms the deletion, THE Todo_List SHALL permanently remove that Task from the list and SHALL continue to display all remaining Tasks.
4. WHEN the user cancels the deletion, THE Todo_List SHALL take no action and SHALL leave the Task in the list unchanged.

---

### Requirement 7: To-Do List — Persistence

**User Story:** As a user, I want my tasks to be saved automatically, so that my list is still available after I close and reopen the browser tab.

#### Acceptance Criteria

1. WHEN a Task is added, edited, marked complete/incomplete, or deleted, THE Storage_Manager SHALL write the updated task list to Local Storage within 300 milliseconds of the triggering action.
2. WHEN the Dashboard loads, THE Storage_Manager SHALL read the task list from Local Storage.
3. WHEN the task list has been read from Local Storage, THE Todo_List SHALL render all previously saved Tasks in their stored order and completion state.
4. IF no task data exists in Local Storage, THEN THE Todo_List SHALL render an empty list with no errors.
5. IF the data read from Local Storage is corrupted or cannot be parsed as a valid task list, THEN THE Storage_Manager SHALL discard the corrupted data, initialise an empty task list, and THE Todo_List SHALL render an empty list without throwing an unhandled error.

---

### Requirement 8: Quick Links — Display and Open

**User Story:** As a user, I want to see my saved quick-link buttons on the dashboard and click them to open websites, so that I can navigate to my favourite sites with a single click.

#### Acceptance Criteria

1. THE Quick_Links SHALL display each saved Link as a labelled button, truncating the label to a maximum of 50 characters if it exceeds that length.
2. WHEN the user activates a Link button whose URL begins with `http://` or `https://`, THE Quick_Links SHALL open the associated URL in a new browser tab.
3. IF a saved Link's stored URL does not begin with `http://` or `https://` and the user activates its button, THEN THE Quick_Links SHALL display an inline error message (e.g., "Invalid URL") adjacent to that button and SHALL NOT navigate away from the Dashboard.
4. WHEN the Dashboard loads, THE Storage_Manager SHALL read the link list from Local Storage and THE Quick_Links SHALL render all previously saved Links.
5. IF no link data exists in Local Storage, THEN THE Quick_Links SHALL render a visible placeholder message (e.g., "No links saved yet") in place of the link buttons.

---

### Requirement 9: Quick Links — Add Links

**User Story:** As a user, I want to add new quick-link buttons by providing a label and a URL, so that I can customise the dashboard with my most-visited sites.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a text input field for a link label, a text input field for a URL, and an "Add Link" control.
2. WHEN the user submits a non-empty label and a non-empty URL via the Add Link control, THE Quick_Links SHALL append the new Link to the panel and SHALL clear both input fields.
3. IF the user attempts to submit with an empty label, THEN THE Quick_Links SHALL not add the Link and SHALL display an inline error message adjacent to the label field (e.g., "Label is required"); WHEN the user begins typing in the label field, THE Quick_Links SHALL remove the label error message.
4. IF the user attempts to submit with an empty URL, THEN THE Quick_Links SHALL not add the Link and SHALL display an inline error message adjacent to the URL field (e.g., "URL is required"); WHEN the user begins typing in the URL field, THE Quick_Links SHALL remove the URL error message.
5. IF the user attempts to submit a URL that does not begin with `http://` or `https://`, THEN THE Quick_Links SHALL not add the Link and SHALL display an inline error message adjacent to the URL field (e.g., "URL must start with http:// or https://"); WHEN the user begins typing in the URL field, THE Quick_Links SHALL remove the URL error message.
6. WHEN a Link is added, THE Storage_Manager SHALL write the updated link list to Local Storage within 300 milliseconds.

---

### Requirement 10: Quick Links — Delete Links

**User Story:** As a user, I want to remove quick-link buttons I no longer need, so that the panel stays relevant and uncluttered.

#### Acceptance Criteria

1. THE Quick_Links SHALL provide a Delete control for each Link in the panel.
2. WHEN the user activates the Delete control for a Link, THE Quick_Links SHALL permanently remove that Link from the panel and SHALL continue to display all remaining Links.
3. WHEN a Link is deleted, THE Storage_Manager SHALL write the updated link list to Local Storage within 300 milliseconds.

---

### Requirement 11: Non-Functional — Performance

**User Story:** As a user, I want the dashboard to load quickly and respond to my interactions without noticeable lag, so that it does not interrupt my workflow.

#### Acceptance Criteria

1. WHEN the Dashboard loads on a connection with a download speed of at least 10 Mbps, THE Dashboard SHALL complete initial render and display all persisted data (up to 100 tasks and 50 links) within 2 seconds.
2. WHEN the user performs any UI interaction (adding, editing, deleting a task or link), THE Dashboard SHALL reflect the DOM/visual change within 100 milliseconds, independently of the Local Storage write operation.

---

### Requirement 12: Non-Functional — Visual Design and Accessibility

**User Story:** As a user, I want a clean, readable interface with a clear visual hierarchy, so that I can use the dashboard comfortably without visual strain.

#### Acceptance Criteria

1. THE Dashboard SHALL apply a consistent typographic scale with a minimum body font size of 14px.
2. THE Dashboard SHALL maintain a colour contrast ratio of at least 4.5:1 between text and its background, in accordance with WCAG 2.1 AA guidelines.
3. THE Dashboard SHALL use a single CSS file located at `css/styles.css` for all visual styling.
4. THE Dashboard SHALL use a single JavaScript file located at `js/app.js` for all application logic.
