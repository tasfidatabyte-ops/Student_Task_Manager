# **Student Task Manager Application**

## Overview Of the Project

TaskFlow is a browser-based productivity application designed for students. It combines task planning, deadline tracking, filtering, calendar organization, productivity statistics, and local data persistence in a clean multi-view interface.

The project is built entirely CSS, and vanilla JavaScript. It requires no framework, package manager, build tool, database, or backend server.

## Live Demo is below

[Open TaskFlow on Vercel](https://taskflow-student-manager-nine.vercel.app/)

## Main Features

### Task Management

- Create, edit, complete, reopen, star, and delete tasks
- Add a title, description, category, subject, priority, status, due date, and due time
- Record estimated effort and reminder preferences
- Add up to eight unique tags to each task
- Validate required fields before saving
- Display character counters for titles and descriptions
- Highlight overdue tasks automatically

### Search, Filters, and Sorting

- Search across task titles, descriptions, subjects, categories, and tags
- Filter tasks by status:
  - All
  - To do
  - In progress
  - Completed
- Filter by task category
- Sort by newest task, nearest deadline, priority, or title
- Keep starred tasks at the top of the task list

### Dashboard and Analytics

- View total, completed, in-progress, and overdue task counts
- Track completion percentage using a visual progress ring
- Review tasks completed during the current week
- Change the statistics period between week, month, and all time
- View high-priority and overdue task summaries
- Review task totals by category

### Calendar

- Browse tasks in a monthly calendar
- Move to the previous or next month
- Return quickly to the current month
- Open a task directly from its calendar entry
- Display up to three tasks per date with an additional-task indicator
- Distinguish priorities using color-coded calendar entries

### Appearance and Layout

- Light and dark themes
- Theme preference saved in the browser
- Collapsible desktop sidebar
- Responsive off-canvas navigation on smaller screens
- Mobile, tablet, laptop, and desktop layouts
- Reduced-motion support
- Print-friendly presentation

### Data Management

- Store tasks locally with `localStorage`
- Save theme, active view, student name, and sidebar preferences
- Export all tasks as a formatted JSON backup
- Import tasks from a valid TaskFlow JSON backup
- Normalize imported task data for safer rendering

### User Experience and Accessibility

- Semantic HTML structure
- Keyboard-focus indicators
- Skip-to-content navigation
- Accessible labels and ARIA attributes
- Live regions for task updates and toast notifications
- Native dialog-based task form
- Empty states and helpful validation messages
- Keyboard shortcuts for search and task creation

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + K` or `Cmd + K` | Focus the global task search |
| `Ctrl + N` or `Cmd + N` | Open the new-task form |
| `Esc` | Close the task dialog |

## Technologies

- **HTML5** for semantic page structure, forms, templates, navigation, and accessibility
- **CSS3** for theming, responsive layouts, design tokens, animations, print styling, and reduced-motion behavior
- **Vanilla JavaScript** for application state, rendering, task actions, filtering, analytics, calendar logic, persistence, and import/export
- **Web Storage API** for local task and preference persistence
- **File and Blob APIs** for JSON backup export and import
- **Crypto API** for unique task identifiers when supported

## Project Structure

```text
TaskFlow/
├── index.html    # Application structure, views, forms, and templates
├── style.css     # Themes, responsive layout, components, and animations
├── script.js     # State, task logic, rendering, storage, and interactions
└── README.md     # Project documentation
```

## Getting Started

### Prerequisites

You only need a modern web browser. No dependencies need to be installed.

Recommended browsers include recent versions of Chrome, Edge, Firefox, and Safari.

### Run Locally

1. Clone the repository:

