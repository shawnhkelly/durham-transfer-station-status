# Repository Guidelines

## Project Structure & Module Organization

This repository is a small static site for checking Durham Transfer Station status.

- `index.html` contains the page markup, metadata, analytics snippet, and script/style includes.
- `style.css` defines the responsive layout, open/closed color states, accessibility helpers, and footer styling.
- `script.js` contains all date, holiday, schedule, and DOM update logic.
- `images/` stores social preview and favicon assets referenced from `index.html`.
- `CNAME` configures the custom domain for GitHub Pages-style hosting.

There is no build system, package manifest, or test directory at present.

## Build, Test, and Development Commands

- `python3 -m http.server 8000` starts a local static server from the repository root.
- Open `http://localhost:8000` to test the page in a browser.
- `git status --short` checks for uncommitted changes before and after edits.

Because this is static HTML/CSS/JS, there is no compile or bundle step.

## Coding Style & Naming Conventions

Use 4-space indentation in HTML, CSS, and JavaScript to match the existing files. Keep JavaScript in plain browser-compatible syntax unless a build step is added. Prefer descriptive camelCase names for functions and variables, such as `getNextOpenTime` and `isHolidayToday`.

Keep schedule rules centralized in `script.js`. When changing hours or closures, add short comments only where the rule is not obvious, especially for town-specific exceptions.

## Testing Guidelines

No automated test framework is configured. Manually verify changes in a browser before opening a pull request.

For schedule logic, test representative dates and times by temporarily using the commented `now` override in `script.js`, then revert it before committing. Cover normal open days, closed days, holidays, Monday-after-Sunday-holiday handling, special Saturday half-days, and the Tuesday after Indigenous People's Day.

## Commit & Pull Request Guidelines

Commit messages in this repo are short and plain, for example `Updating footer language` and `Adding Google Analytics`. Keep each commit focused on one concern.

Pull requests should include a short summary, any changed schedule assumptions, and manual test notes with dates/times checked. Include screenshots when visual layout, colors, metadata, or mobile behavior changes.

## Security & Configuration Tips

Verify official schedule changes against the linked Town of Durham page before editing logic. Review `CNAME`, analytics IDs, external links, and social image URLs carefully because they affect production behavior and sharing.
