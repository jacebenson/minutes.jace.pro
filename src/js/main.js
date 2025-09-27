// Main JavaScript orchestrator for the meeting minutes app
import { setupInputElements, setupDateTimePicker } from './modules/form-inputs.js';
import { setupTableNavigation } from './modules/table-navigation.js';
import { setupMetaFieldToggles } from './modules/meta-fields.js';
import { setupKeyboardShortcuts } from './modules/keyboard-shortcuts.js';
import { setupMarkdownCopy, setupMarkdownImport } from './modules/markdown.js';
import { setupNewFormButton } from './modules/form-management.js';
import { setupMeetingTicker } from './modules/meeting-ticker.js';

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Initialize all modules
  setupInputElements();
  setupTableNavigation();
  setupMetaFieldToggles();
  setupKeyboardShortcuts();
  setupDateTimePicker();
  setupMarkdownCopy();
  setupMarkdownImport();
  setupNewFormButton();
  setupMeetingTicker();
}

