# TaskFlow | Student Task Manager

![Version](https://img.shields.io/badge/version-v1.0.0-4f46e5)
![Status](https://img.shields.io/badge/status-stable-16a34a)
![HTML](https://img.shields.io/badge/HTML5-frontend-e34f26)
![CSS](https://img.shields.io/badge/CSS3-responsive-1572b6)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-f7df1e)

TaskFlow is a responsive, browser-based student task management application. It helps students organize assignments, projects, exam preparation, deadlines, priorities, and study activities from one focused dashboard.

The project was also developed as a practical demonstration of Git and GitHub collaboration. It includes branching, merging, conflict resolution, stashing, restoring, resetting, reverting, tagging, pull requests, issues, and release management.

---

## Table of Contents

- [Project Description](#project-description)
- [Team Members](#team-members)
- [Features](#features)
- [Technologies](#technologies)
- [Project Structure](#project-structure)
- [Git Workflow](#git-workflow)
- [Branches](#branches)
- [Git Commands Demonstrated](#git-commands-demonstrated)
- [GitHub Features Demonstrated](#github-features-demonstrated)
- [How to Run](#how-to-run)
- [Screenshots](#screenshots)
- [Version History](#version-history)
- [Contributors](#contributors)

---

## Project Description

**TaskFlow** is a client-side student planner designed to make academic task management easier. Users can create, edit, complete, prioritize, search, filter, sort, and delete tasks. The application provides dashboard statistics, a task calendar, analytics, categories, theme preferences, and task-data import/export.

Data is stored in the browser using `localStorage`, so no server or database is required. The interface is designed for desktop, tablet, and mobile screens and includes accessibility-focused features such as semantic labels, keyboard navigation, focus styles, and reduced-motion support.

### Project Objectives

- Build a functional and responsive student task manager.
- Practice structured front-end development with HTML, CSS, and JavaScript.
- Apply Git version-control commands in a real project.
- Demonstrate collaborative development through branches and GitHub pull requests.
- Maintain a clear project history using commits, tags, and releases.

---

## Team Members

- **Tasfi ul Iman** - Project Owner and Developer
- **Muhammad Hassan** - Contributor and Collaborator

---

## Features

### Task Management

- Create new tasks with titles, descriptions, categories, subjects, and due dates.
- Edit existing task details.
- Delete tasks with a confirmation prompt.
- Mark tasks as completed or reopen completed tasks.
- Assign low, medium, or high priority.
- Mark important tasks with a star.
- Add tags, reminders, due times, and estimated effort.
- Validate required task information before saving.

### Organization and Discovery

- Search tasks by title, description, subject, category, or tag.
- Filter tasks by status and category.
- Sort tasks by newest, deadline, priority, or title.
- Group tasks into assignment, project, exam, personal, and other categories.

### Dashboard and Analytics

- Display total, completed, in-progress, and overdue task counts.
- Calculate completion percentage.
- Show weekly completion progress.
- Present high-priority and overdue-task analytics.
- Provide an interactive monthly task calendar.

### User Experience

- Responsive layout for desktop, tablet, and mobile devices.
- Light and dark themes.
- Collapsible desktop sidebar and responsive off-canvas navigation.
- Toast notifications for user actions.
- Keyboard shortcuts:
  - `Ctrl + K` or `Cmd + K` to focus search.
  - `Ctrl + N` or `Cmd + N` to create a new task.
- Accessible form labels, focus indicators, and reduced-motion support.

### Data Management

- Save tasks and preferences in browser `localStorage`.
- Export tasks as a JSON backup.
- Import tasks from a valid TaskFlow JSON backup.

---

## Technologies

- **HTML5** for semantic page structure and accessible controls.
- **CSS3** for layout, responsive design, themes, animations, and component styling.
- **JavaScript ES6+** for application logic, DOM manipulation, validation, filtering, analytics, calendar rendering, and local storage.
- **Git** for local version control.
- **GitHub** for remote hosting, collaboration, issues, pull requests, tags, and releases.
- **Visual Studio Code** or another source-code editor.
- **Web Browser** such as Microsoft Edge, Google Chrome, or Mozilla Firefox.

---

## Project Structure

```text
Student_Task_Manager/
├── index.html       # Main application structure
├── style.css        # Responsive styling, themes, and layouts
├── script.js        # Task management and interface logic
├── README.md        # Project documentation
└── screenshots/     # Assignment and application screenshots
```

---

## Git Workflow

The team used a branch-based collaborative workflow:

1. Initialize or clone the repository.
2. Synchronize the local `main` branch with the remote repository.
3. Create or switch to a separate feature branch.
4. Make focused changes to the project.
5. Inspect changed files using `git status` and `git diff`.
6. Stage changes using `git add`.
7. Create a meaningful commit using `git commit`.
8. Push the feature branch to GitHub.
9. Open a pull request into `main`.
10. Review the pull request and resolve any merge conflict.
11. Merge the approved pull request.
12. Pull the updated `main` branch locally.
13. Create and push a stable version tag such as `v1.0.0`.
14. Publish a GitHub release from the tag.

### Example Feature Workflow

```bash
git switch main
git pull origin main
git switch -c feature/example-feature

# Make and inspect changes
git status
git diff

# Stage, commit, and push
git add .
git commit -m "Add example feature"
git push -u origin feature/example-feature
```

After review and merge:

```bash
git switch main
git pull origin main
```

---

## Branches

- **`main`** - Stable and production-ready project code.
- **`frontend`** - Front-end development and interface updates by Tasfi ul Iman.
- **`feature/ui_design`** - User-interface design work by Muhammad Hassan.
- **`feature/layout`** - Responsive layout improvements and related issue work.

Each feature branch was developed independently and merged into `main` after review.

---

## Git Commands Demonstrated

### `git init`

Initializes a new local Git repository in the current project directory.

```bash
git init
```

**Evidence:** Screenshot 3

### `git status`

Displays the current branch and the state of tracked, modified, staged, and untracked files.

```bash
git status
```

**Evidence:** Screenshots 3-5

### `git add`

Stages selected changes for the next commit.

```bash
git add .
# or
git add README.md
```

**Evidence:** Screenshot 4

### `git commit`

Creates a permanent snapshot of the staged changes in local repository history.

```bash
git commit -m "Add initial TaskFlow project files"
```

**Evidence:** Screenshot 5

### `git log`

Displays commit history, including commit hashes, authors, dates, and messages.

```bash
git log
git log --oneline
```

**Evidence:** Screenshot 6

### `git branch`

Lists local branches. It can also create or delete branches.

```bash
git branch
git branch frontend
git branch -d temporary-branch
```

**Evidence:** Screenshots 9 and 14

### `git switch`

Switches from the current branch to another branch or creates a new branch.

```bash
git switch frontend
git switch -c feature/layout
```

**Evidence:** Screenshots 9 and 20

### `git diff`

Shows unstaged changes in the working directory.

```bash
git diff
```

**Evidence:** Screenshot 10

### `git diff --staged`

Shows changes that have been staged and are ready for the next commit.

```bash
git diff --staged
```

**Evidence:** Demonstrated and documented

### `git clone`

Downloads a remote repository and creates a local working copy.

```bash
git clone <repository-url>
cd Student_Task_Manager
```

**Evidence:** Screenshot 14

### `git remote -v`

Displays the fetch and push URLs of configured remote repositories.

```bash
git remote -v
```

**Evidence:** Screenshot 34

### `git push`

Uploads local commits or tags to the remote GitHub repository.

```bash
git push origin frontend
git push -u origin feature/layout
git push --tags
```

**Evidence:** Screenshots 8 and 13

### `git fetch`

Downloads remote commits, branches, and references without merging them into the current branch.

```bash
git fetch origin
```

**Evidence:** Demonstrated and documented

### `git pull`

Fetches remote changes and integrates them into the current local branch.

```bash
git pull origin main
```

**Evidence:** Screenshot 20

### `git merge`

Combines changes from one branch into the currently checked-out branch.

```bash
git switch main
git merge frontend
```

If a conflict appears, edit the conflicted file, remove conflict markers, and complete the merge:

```bash
git add README.md
git commit -m "Resolve README merge conflict"
```

**Evidence:** Screenshots 23-26

### `git stash`

Temporarily saves uncommitted modifications and returns the working tree to a clean state.

```bash
git stash
git status
git stash list
git stash show -p
git stash pop
```

**Evidence:** Screenshot 27

### `git restore`

Discards unstaged changes and restores a file to its last committed state.

```bash
git diff
git restore style.css
git status
```

**Evidence:** Screenshot 28

### `git reset`

Moves `HEAD` or a branch reference. A soft reset removes the latest commit while preserving its changes in the staging area.

```bash
git add .
git commit -m "Temporary test commit"
git log --oneline
git reset --soft HEAD~1
git status
```

**Evidence:** Screenshot 29

### `git revert`

Creates a new commit that reverses the changes introduced by an earlier commit while preserving the original commit in history.

```bash
git log --oneline
git revert <commit-hash>
```

**Evidence:** Screenshot 30

### `git show`

Displays detailed information about a commit and its changes.

```bash
git show <commit-hash>
git show HEAD
```

**Evidence:** Demonstrated and documented

### `git blame`

Shows the author and commit responsible for each line of a file.

```bash
git blame README.md
git blame index.html
```

**Evidence:** Demonstrated and documented

### `git tag`

Creates a named marker for a stable version of the project.

```bash
git tag v1.0.0
git tag
git push origin v1.0.0
# or push all local tags
git push --tags
```

**Evidence:** Screenshot 32

---

## GitHub Features Demonstrated

- Remote repository creation and hosting.
- Repository cloning.
- Remote branch publishing.
- Issues for planning and tracking work.
- Feature branches for isolated development.
- Pull requests for proposing changes.
- Pull-request review by a collaborator.
- Merge-conflict creation and resolution.
- Commit history inspection on GitHub.
- Contributor tracking.
- Version tags.
- GitHub Release creation for `v1.0.0`.

---

## How to Run

### Option 1: Open Directly

1. Download or clone the project.
2. Open the project folder.
3. Double-click `index.html`.
4. The application will open in your default web browser.

### Option 2: Clone with Git

```bash
git clone <https://github.com/tasfidatabyte-ops/Student_Task_Manager>
cd Student_Task_Manager
```

Then open `index.html` in a modern browser.

### Option 3: Use Visual Studio Code Live Server

1. Open the project folder in Visual Studio Code.
2. Install the **Live Server** extension if needed.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

### System Requirements

- A modern web browser with JavaScript enabled.
- No database, package installation, or back-end server is required.

---

## Screenshots



### Application Preview

![TaskFlow Dashboard](/Assets//SS_37.png)



### Git and GitHub Evidence


![](/Assets/SS_1.png)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2010.41.03%20PM.jpeg)
![](/Assets/Task_02.png)
![](/Assets/Task_3.png)
![](/Assets/Task_04.png)
![](/Assets/Task_05.png)
![](/Assets/Task_06.png)
![](/Assets/Task_07.png)
![](/Assets/Task_08.png)
![](/Assets/Task_09.png)
![](/Assets/Task_10.png)
![](/Assets/Screenshot%202026-10-06%20224705.png)
![](/Assets/Task_11.png)
![](/Assets/Task_12.png)
![](/Assets/Screenshot%202026-10-06%20225045.png)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2010.58.45%20PM.jpeg)
![](/Assets/Screenshot%202026-10-06%20224202.png)
![](/Assets/SS_14.png)
![](/Assets/Task_18(1).png)
![](/Assets/Task_19(22).png)
![](/Assets/Task_20_ss_24%20(3).png)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2011.13.51%20PM%20(1).jpeg)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2011.13.51%20PM%20(3).jpeg)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2011.13.51%20PM.jpeg)
![](/Assets/Task_20_ss_24%20(1).png)
![](/Assets/Task_20_ss_24%20(2).png)
![](/Assets/Task_21_ss_26.png)
![](/Assets/Task_22_27.png)
![](/Assets/Task_23_ss_28.png)
![](/Assets/Task_24_ss_29.png)
![](/Assets/WhatsApp%20Image%202026-10-07%20at%2012.02.19%20AM.jpeg)
![](/Assets/WhatsApp%20Image%202026-10-06%20at%2011.13.51%20PM.jpeg)
![](/Assets/WhatsApp%20Image%202026-10-07%20at%2012.02.18%20AM.jpeg)
![](/Assets/Task_29_ss_32.png)
![](/Assets/Task_30_34.png)
![](/Assets/Task_35.png)
![](/Assets/)
- **Screenshot 3:** Repository initialization and initial status.
- **Screenshot 4:** Staging changes with `git add`.
- **Screenshot 5:** Creating a commit and checking status.
- **Screenshot 6:** Viewing commit history with `git log`.
- **Screenshot 8:** Pushing commits to the remote repository.
- **Screenshot 9:** Listing and switching branches.
- **Screenshot 10:** Inspecting unstaged changes with `git diff`.
- **Screenshot 13:** Pushing a feature branch.
- **Screenshot 14:** Cloning the repository and viewing branches.
- **Screenshot 20:** Switching branches and pulling remote updates.
- **Screenshots 23-26:** Creating and resolving a merge conflict.
- **Screenshot 27:** Saving and restoring work with `git stash`.
- **Screenshot 28:** Discarding uncommitted changes with `git restore`.
- **Screenshot 29:** Removing a temporary commit with `git reset --soft`.
- **Screenshot 30:** Reversing a commit safely with `git revert`.
- **Screenshot 32:** Creating and pushing the `v1.0.0` tag.
- **Screenshot 34:** Displaying remote URLs with `git remote -v`.

---

## Version History

### v1.0.0

**Status:** Stable release

- Added the responsive TaskFlow student dashboard.
- Added task creation, editing, deletion, completion, and prioritization.
- Added search, filters, categories, sorting, calendar, and analytics.
- Added dark and light themes.
- Added local task persistence with import and export support.
- Improved responsive behavior for mobile, tablet, and desktop widths.
- Completed the collaborative Git and GitHub workflow.
- Added project documentation and screenshot evidence.

---

## Contributors

### Tasfi ul Iman

- Project owner and primary developer.
- Worked on the TaskFlow front end, application logic, repository management, integration, and documentation.

### Muhammad Hassan

- Project contributor and collaborator.
- Worked on UI design, feature-branch development, project collaboration, and pull-request contributions.

---

## License

This project was created for educational and academic purposes.

---

## Click below to take a try

## [Task-Flow](https://taskflow-student-manager-nine.vercel.app)

**TaskFlow** | Plan smarter. Finish stronger.
