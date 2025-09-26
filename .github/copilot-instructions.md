# Copilot Instructions for Meeting Minutes App

## Architecture Overview

This is a **static site meeting minutes application** built with **Eleventy** and **modular ES6 JavaScript**. The app provides a form-based interface for taking meeting notes with markdown import/export and real-time cost tracking.

### Key Technologies
- **Static Site Generator**: Eleventy (11ty) with Nunjucks templates
- **Frontend**: Vanilla JavaScript ES6 modules (no frameworks)
- **Build Process**: `npm run dev` for development with live reload
- **Structure**: Source in `src/`, builds to `_site/`, modules in `src/js/modules/`

## Development Workflow

```bash
npm run dev          # Start dev server with watch (most common)
npm run build        # Production build
npm run serve        # Serve without watch
```

The app auto-rebuilds on file changes. JavaScript uses ES6 modules loaded via `<script type="module">`.

## JavaScript Architecture

**Modular Structure**: The app uses a module-per-feature pattern orchestrated by `src/js/main.js`:

```javascript
// Main orchestrator pattern
import { setupInputElements, setupDateTimePicker } from './modules/form-inputs.js';
import { setupTableNavigation } from './modules/table-navigation.js';
import { setupMarkdownCopy, setupMarkdownImport } from './modules/markdown.js';
import { setupMeetingTicker } from './modules/meeting-ticker.js';
// etc...

function initializeApp() {
  setupInputElements();
  setupTableNavigation();
  // ... initialize all modules
}
```

### Core Modules
- **`table-navigation.js`**: Dynamic row management, keyboard navigation (Alt+arrows)
- **`markdown.js`**: Bidirectional markdown conversion with complex parsing
- **`meeting-ticker.js`**: Real-time cost calculation based on attendee count × hourly rate × time
- **`form-inputs.js`**: Auto-resize textareas, date/time defaults to 15-min intervals
- **`keyboard-shortcuts.js`**: Alt+Enter for row insertion, navigation shortcuts
- **`meta-fields.js`**: Toggle visibility of optional form sections

## Form Data Model

The app centers around a **structured meeting form**:

```javascript
// Primary fields (always visible)
project, title, heldAt (datetime-local), place, minuteTaker, attendees

// Toggleable meta fields
others, description  // Hidden by default, toggled via data-toggle attributes

// Dynamic table rows
topic, type (select), note, owner, dueAt  // Managed by table-navigation.js
```

### Meeting Cost Tracker
- **Auto-counts attendees** from the attendees textarea (line/comma/semicolon parsing)
- **Calculates from meeting start time** (heldAt field), not button press time
- **Shows annual equivalent**: hourly rate × 2080 hours = annual salary context
- **Exports to markdown** when used (cost ≠ $0.00)

## Data Flow Patterns

### Markdown Round-Trip
```javascript
// Export: Form → generateMarkdown() → structured markdown
// Import: Markdown → parseAndImportMarkdown() → populate form + table rows
```

The markdown parser handles **complex formats**: multi-line notes with backslash continuation, legacy format compatibility, and smart section detection.

### Dynamic Table Management
- **Template-based row creation**: Clone first row, clear content, setup events
- **Auto-add rows**: On blur from last row with content (prevents tab-navigation interference)
- **Global functions**: `window.addNewRow()` for keyboard shortcut access

## Date/Time Conventions

**15-minute interval rounding**: All default times round DOWN to previous quarter-hour:
```javascript
// 11:07 → 11:00, 11:23 → 11:15, 11:38 → 11:30, 11:52 → 11:45
const roundedMinutes = Math.floor(minutes / 15) * 15;
```

Applied on: page load, form reset, "New" button. Uses `date-utils.js` for consistency.

## Styling Strategy

**Programmatic CSS injection**: Styles are injected via `applyGlobalStyles()` rather than separate CSS files for component-specific styles. This keeps module-specific styling co-located with functionality.

## Key UI Patterns

### Toggle Sections Pattern
```javascript
// All toggle buttons use consistent data-toggle pattern
<dd data-toggle="others">Others</dd>  // Standard toggles
<dd id="meeting-ticker-toggle">...</dd>  // Custom handler (no data-toggle)
```

### Input Enhancement Pattern
```javascript
// Common pattern: enhance inputs after DOM selection
const input = document.querySelector('...');
if (input) {
  // Add event listeners, auto-behavior, validation
}
```

## File Organization Notes

- **`src/index.njk`**: Main template with Nunjucks front matter
- **`src/_layouts/base.njk`**: Base HTML shell, includes module script tag
- **`_site/`**: Generated output (gitignored, auto-built)
- **Keep modules focused**: Each module handles one feature area completely

## Testing Approach

Manual testing via `npm run dev` and browser interaction. No automated test framework currently in use - verify functionality through the UI.

When adding features, follow the **setup function export pattern** and add to the main orchestrator's `initializeApp()` sequence.