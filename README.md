# Todo List App

A lightweight task manager built with HTML, CSS, and JavaScript. Tasks are stored in the browser using `localStorage`, so your data persists across refreshes.

## Features

- Add tasks with priority and due date
- Mark tasks as complete or incomplete
- Edit or delete tasks
- Search tasks by text
- Filter by all, active, or completed tasks
- Clear completed items
- Persistent local storage
- Light/dark theme toggle

## Run locally

### Option 1: Open directly in a browser

1. Open `index.html` in your browser.
2. Start adding tasks.

### Option 2: Use a simple local web server

```bash
cd todo-list-app
python3 -m http.server 3000
```

Then visit `http://localhost:3000`.

## Project files

- `index.html` — app structure
- `styles.css` — styles and theme support
- `app.js` — task logic and local storage management

## Notes

This project uses browser local storage, which means the data is stored on the device in the browser and is not synced across devices or shared with a backend.
