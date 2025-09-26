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
  
  // Apply global styles
  applyGlobalStyles();
}

function applyGlobalStyles() {
  // Add CSS for better input styling
  const style = document.createElement('style');
  style.textContent = `
    .input-field:focus,
    .textarea-field:focus {
      outline: 2px solid #007acc;
      outline-offset: 1px;
    }
    
    input[type="datetime-local"] {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: inherit;
      font-size: inherit;
    }
    
    input[type="datetime-local"]:focus {
      outline: 2px solid #007acc;
      outline-offset: 1px;
      border-color: #007acc;
    }
    
    .project-row {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 10px;
    }
    
    .new-form-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .new-form-btn:hover {
      background: #c82333;
    }
    
    .import-markdown-btn,
    .copy-markdown-btn {
      background: #007acc;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .import-markdown-btn:hover,
    .copy-markdown-btn:hover {
      background: #0056b3;
    }
    
    .add-row-btn {
      margin-top: 10px;
      padding: 8px 16px;
      background: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    .add-row-btn:hover {
      background: #218838;
    }
    
    /* Dialog styling */
    dialog {
      border: none;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90vw;
    }
    
    dialog::backdrop {
      background: rgba(0, 0, 0, 0.5);
    }
    
    .dialog-content h3 {
      margin-top: 0;
      color: #333;
    }
    
    .dialog-buttons {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 20px;
    }
    
    .dialog-buttons button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    
    #cancel-import,
    #cancel-reset {
      background: #6c757d;
      color: white;
    }
    
    #cancel-import:hover,
    #cancel-reset:hover {
      background: #5a6268;
    }
    
    #confirm-import,
    #confirm-reset {
      background: #007acc;
      color: white;
    }
    
    #confirm-import:hover,
    #confirm-reset:hover {
      background: #0056b3;
    }
    
    #markdown-input {
      width: 100%;
      min-height: 300px;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-family: monospace;
      font-size: 14px;
      resize: vertical;
    }
    
    /* Meeting Ticker Styles */
    .meeting-ticker-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .ticker-info {
      color: #6c757d;
      font-size: 13px;
      font-style: italic;
    }
    
    .ticker-inputs {
      display: flex;
      gap: 20px;
      align-items: flex-end;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .input-group label {
      font-size: 12px;
      font-weight: 500;
      color: #495057;
      margin: 0;
    }
    
    .input-help {
      font-size: 11px;
      color: #6c757d;
      font-style: italic;
      margin-top: 2px;
    }
    
    .ticker-controls {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .ticker-input {
      width: 80px;
      padding: 6px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }
    
    .ticker-input:disabled {
      background-color: #f5f5f5;
      color: #666;
    }
    
    .ticker-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
    }
    
    .ticker-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .ticker-start {
      background: #28a745;
      color: white;
    }
    
    .ticker-start:hover:not(:disabled) {
      background: #218838;
    }
    
    .ticker-stop {
      background: #dc3545;
      color: white;
    }
    
    .ticker-stop:hover:not(:disabled) {
      background: #c82333;
    }
    
    .ticker-reset {
      background: #6c757d;
      color: white;
    }
    
    .ticker-reset:hover:not(:disabled) {
      background: #5a6268;
    }
    
    .ticker-display {
      display: flex;
      justify-content: flex-end;
    }
    
    .cost-info {
      text-align: right;
      background: #f8f9fa;
      padding: 12px 16px;
      border-radius: 6px;
      border-left: 4px solid #dc3545;
      min-width: 120px;
    }
    
    #cost-display {
      font-size: 1.5em;
      font-weight: bold;
      color: #dc3545;
      line-height: 1.2;
    }
    
    #duration-display {
      font-size: 0.85em;
      color: #6c757d;
      margin-top: 2px;
    }
    
    .site-footer {
      text-align: center;
      padding: 20px;
      margin-top: 40px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    
    .site-footer a {
      color: #007acc;
      text-decoration: none;
    }
    
    .site-footer a:hover {
      text-decoration: underline;
    }
  `;
  document.head.appendChild(style);
}