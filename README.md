# Student Registration System (Pure HTML/CSS/JS)

A clean, responsive, and shiny-looking student registration system that lets you add, edit, delete, search, and persist records using `localStorage`.

## Features
- ✅ Add / Edit / Delete records
- ✅ Validations
  - Name: letters + spaces (2–60)
  - Student ID: digits only, unique
  - Email: valid format
  - Contact: digits only, at least 10
- ✅ Prevents empty rows
- ✅ Records persist across refresh (localStorage)
- ✅ Dynamic vertical scrollbar for the table (JS toggles when rows > 7)
- ✅ Fully responsive (mobile ≤640px, tablet 641–1024px, desktop ≥1025px)
- ✅ Semantic HTML and accessible labels with `aria-live` updates
- ✅ Pure HTML, CSS, JS (no frameworks)

## Getting Started
Just open `index.html` in your browser.

## File Structure
```
student-registration-system/
├── index.html
├── styles.css
└── script.js
```

## Notes for Submission
- Keep separate commits for HTML, CSS, JS, and README as required.
- If you use any tooling, ensure no `node_modules` in submission.
