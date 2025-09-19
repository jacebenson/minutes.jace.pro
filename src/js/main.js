// Main JavaScript functionality for the meeting minutes app

document.addEventListener('DOMContentLoaded', function() {
  
  // Initialize the app
  initializeApp();
  
  function initializeApp() {
    setupInputElements();
    setupTableNavigation();
    setupMetaFieldToggles();
    setupKeyboardShortcuts();
    setupRowActions();
    setupDateTimePicker();
    setupMarkdownCopy();
    setupMarkdownImport();
  }
  
  // Input element enhancements
  function setupInputElements() {
    const inputElements = document.querySelectorAll('.input-field, .textarea-field');
    
    inputElements.forEach(element => {
      // Auto-resize textareas
      if (element.tagName === 'TEXTAREA') {
        setupTextareaAutoResize(element);
      }
    });
  }
  
  function setupTextareaAutoResize(textarea) {
    function resize() {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
    
    textarea.addEventListener('input', resize);
    textarea.addEventListener('focus', resize);
    resize(); // Initial resize
  }

  // Date/Time picker setup
  function setupDateTimePicker() {
    const dateTimeInput = document.querySelector('input[name="heldAt"]');
    if (dateTimeInput && !dateTimeInput.value) {
      // Set default to current date and time
      const now = new Date();
      // Format as YYYY-MM-DDTHH:MM (required format for datetime-local)
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      dateTimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}`;
    }
  }
  
  // Table navigation and management
  function setupTableNavigation() {
    const table = document.querySelector('.minutes .table');
    if (!table) return;
    
    // Add new row functionality
    const tbody = table.querySelector('tbody');
    const templateRow = tbody.querySelector('tr').cloneNode(true);
    
    // Make addNewRow globally accessible for keyboard shortcuts
    window.addNewRow = function() {
      const newRow = templateRow.cloneNode(true);
      clearRowContent(newRow);
      tbody.appendChild(newRow);
      setupRowEvents(newRow);
      
      // Focus first input in new row
      const firstInput = newRow.querySelector('.input-field');
      if (firstInput) {
        firstInput.focus();
      }
    };
    
    function clearRowContent(row) {
      const inputElements = row.querySelectorAll('.input-field, .textarea-field');
      inputElements.forEach(el => {
        el.value = '';
      });
      
      const selects = row.querySelectorAll('select');
      selects.forEach(select => {
        select.selectedIndex = select.querySelector('[selected]') ? 
          Array.from(select.options).indexOf(select.querySelector('[selected]')) : 0;
      });
    }    function setupRowEvents(row) {
      // Remove button
      const removeBtn = row.querySelector('[data-remove]');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          if (tbody.children.length > 1) {
            row.remove();
          }
        });
      }
    }
    
    // Setup existing rows
    tbody.querySelectorAll('tr').forEach(setupRowEvents);
    
    let isNavigating = false; // Track if user is navigating with Tab/Shift+Tab
    
    // Track navigation keys to prevent unwanted row creation
    tbody.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        isNavigating = true;
        // Reset flag after navigation completes
        setTimeout(() => {
          isNavigating = false;
        }, 100);
      }
    }, true);
    
    // Auto-add new row only when user finishes with the last row (not during Tab navigation)
    tbody.addEventListener('blur', function(e) {
      // Only trigger on blur events from input fields
      if (!e.target.matches('.input-field, .textarea-field')) return;
      
      // Don't create new row if user is just navigating with Tab
      if (isNavigating) return;
      
      const rows = Array.from(tbody.children);
      const lastRow = rows[rows.length - 1];
      
      // Check if the blur event came from the last row
      if (!lastRow.contains(e.target)) return;
      
      const hasContent = Array.from(lastRow.querySelectorAll('.input-field, .textarea-field'))
        .some(el => el.value.trim() !== '');
      
      if (hasContent) {
        window.addNewRow();
      }
    }, true); // Use capture phase to catch blur events
    
    // Add button to manually add new row
    const addRowButton = document.createElement('button');
    addRowButton.textContent = '+ Add Row';
    addRowButton.className = 'add-row-btn';
    addRowButton.type = 'button';
    addRowButton.addEventListener('click', function() {
      window.addNewRow();
    });
    
    // Insert button after the table
    table.parentNode.insertBefore(addRowButton, table.nextSibling);
  }
  
  // Meta field toggles
  function setupMetaFieldToggles() {
    const toggles = document.querySelectorAll('[data-toggle]');
    
    toggles.forEach(toggle => {
      toggle.addEventListener('click', function() {
        const targetClass = this.getAttribute('data-toggle');
        const targetRow = document.querySelector(`.${targetClass}`);
        
        if (targetRow) {
          const isVisible = targetRow.style.display !== 'none';
          targetRow.style.display = isVisible ? 'none' : '';
          
          // Focus first input when showing
          if (!isVisible) {
            const firstInput = targetRow.querySelector('.input-field, .textarea-field');
            if (firstInput) {
              firstInput.focus();
            }
          }
        }
      });
    });
  }
  
  // Keyboard shortcuts
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      const isWin = navigator.platform.indexOf('Win') > -1;
      const modKey = isWin ? e.altKey : e.metaKey;
      
      const table = document.querySelector('.minutes .table tbody');
      const currentCell = document.activeElement;
      
      // Handle Enter key for adding new rows (without modifier key)
      if (e.key === 'Enter' && !modKey && currentCell.closest('.minutes tbody')) {
        const currentRow = currentCell.closest('tr');
        if (currentRow) {
          e.preventDefault();
          
          // Check if this is the last row
          const rows = Array.from(table.children);
          const currentRowIndex = rows.indexOf(currentRow);
          
          if (currentRowIndex === rows.length - 1) {
            // Last row - add new row below and move to it
            window.addNewRow();
            // Use setTimeout to ensure the new row is added before navigation
            setTimeout(() => {
              const newRows = Array.from(table.children);
              navigateToCell(table, newRows.length - 1, 0);
            }, 0);
          } else {
            // Not last row - just move to next row, same column
            const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell.closest('td'));
            navigateToCell(table, currentRowIndex + 1, currentCellIndex);
          }
        }
        return;
      }
      
      // Modified key shortcuts
      if (!modKey) return;
      
      if (!table || !currentCell.closest('tr')) return;
      
      const currentRow = currentCell.closest('tr');
      const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell.closest('td'));
      const currentRowIndex = Array.from(table.children).indexOf(currentRow);
      
      switch(e.key) {
        case 'ArrowUp':
          e.preventDefault();
          navigateToCell(table, currentRowIndex - 1, currentCellIndex);
          break;
        case 'ArrowDown':
          e.preventDefault();
          navigateToCell(table, currentRowIndex + 1, currentCellIndex);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          navigateToCell(table, currentRowIndex, currentCellIndex - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToCell(table, currentRowIndex, currentCellIndex + 1);
          break;
        case 'Enter':
          e.preventDefault();
          if (e.shiftKey) {
            insertRowAbove(table, currentRowIndex);
          } else {
            insertRowBelow(table, currentRowIndex);
          }
          break;
        case 'Backspace':
          if (e.shiftKey) {
            e.preventDefault();
            deleteRow(table, currentRowIndex);
          }
          break;
      }
    });
  }
  
  function navigateToCell(table, rowIndex, cellIndex) {
    const rows = table.children;
    if (rowIndex < 0 || rowIndex >= rows.length) return;
    
    const targetRow = rows[rowIndex];
    const cells = Array.from(targetRow.children).filter(cell => 
      !cell.classList.contains('actions')
    );
    
    if (cellIndex < 0 || cellIndex >= cells.length) return;
    
    const targetCell = cells[cellIndex];
    const inputElement = targetCell.querySelector('.input-field') || 
                        targetCell.querySelector('.textarea-field') ||
                        targetCell.querySelector('select');
    
    if (inputElement) {
      inputElement.focus();
    }
  }
  
  function insertRowBelow(table, currentIndex) {
    const templateRow = table.children[0].cloneNode(true);
    clearRowContent(templateRow);
    
    if (currentIndex + 1 < table.children.length) {
      table.insertBefore(templateRow, table.children[currentIndex + 1]);
    } else {
      table.appendChild(templateRow);
    }
    
    setupRowEvents(templateRow);
    navigateToCell(table, currentIndex + 1, 0);
  }
  
  function insertRowAbove(table, currentIndex) {
    const templateRow = table.children[0].cloneNode(true);
    clearRowContent(templateRow);
    
    table.insertBefore(templateRow, table.children[currentIndex]);
    setupRowEvents(templateRow);
    navigateToCell(table, currentIndex, 0);
  }
  
  function deleteRow(table, currentIndex) {
    if (table.children.length > 1) {
      table.children[currentIndex].remove();
      const newIndex = Math.min(currentIndex, table.children.length - 1);
      navigateToCell(table, newIndex, 0);
    }
  }
  
  function clearRowContent(row) {
    const inputElements = row.querySelectorAll('.input-field, .textarea-field');
    inputElements.forEach(el => {
      el.value = '';
    });
    
    const selects = row.querySelectorAll('select');
    selects.forEach(select => {
      select.selectedIndex = 5; // Default to "TODO"
    });
  }
  
  function setupRowEvents(row) {
    const removeBtn = row.querySelector('[data-remove]');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        const table = row.closest('tbody');
        if (table.children.length > 1) {
          row.remove();
        }
      });
    }
  }
  
  // Row actions
  function setupRowActions() {
    document.addEventListener('click', function(e) {
      if (e.target.matches('[data-remove]')) {
        const row = e.target.closest('tr');
        const tbody = row.closest('tbody');
        
        if (tbody.children.length > 1) {
          row.remove();
        }
      }
    });
  }

  // Markdown copy functionality
  function setupMarkdownCopy() {
    const copyButton = document.getElementById('copy-markdown-btn');
    if (!copyButton) return;

    copyButton.addEventListener('click', function() {
      const markdown = generateMarkdown();
      copyToClipboard(markdown);
    });
  }

  function generateMarkdown() {
    // Collect form data
    const project = document.querySelector('input[name="project"]')?.value || '';
    const title = document.querySelector('input[name="title"]')?.value || '';
    const heldAt = document.querySelector('input[name="heldAt"]')?.value || '';
    const place = document.querySelector('input[name="place"]')?.value || '';
    const minuteTaker = document.querySelector('input[name="minuteTaker"]')?.value || '';
    const attendees = document.querySelector('textarea[name="attendees"]')?.value || '';
    const others = document.querySelector('textarea[name="others"]')?.value || '';
    const description = document.querySelector('textarea[name="description"]')?.value || '';

    // Format date/time if provided
    let formattedDate = '';
    if (heldAt) {
      const date = new Date(heldAt);
      formattedDate = date.toLocaleString();
    }

    // Start building markdown
    let markdown = '';
    
    // Header
    if (project) markdown += `# ${project}\n\n`;
    if (title) markdown += `## ${title}\n\n`;
    
    // Meeting details
    markdown += `### Meeting Details\n\n`;
    if (formattedDate) markdown += `**Date/Time:** ${formattedDate}\n\n`;
    if (place) markdown += `**Location:** ${place}\n\n`;
    if (minuteTaker) markdown += `**Minute Taker:** ${minuteTaker}\n\n`;
    
    // Attendees
    if (attendees) {
      markdown += `**Attendees:**\n`;
      attendees.split('\n').forEach(attendee => {
        if (attendee.trim()) markdown += `- ${attendee.trim()}\n`;
      });
      markdown += '\n';
    }
    
    // Others
    if (others) {
      markdown += `**Others:**\n`;
      others.split('\n').forEach(other => {
        if (other.trim()) markdown += `- ${other.trim()}\n`;
      });
      markdown += '\n';
    }
    
    // Description
    if (description) {
      markdown += `### Description\n\n${description}\n\n`;
    }
    
    // Minutes/Action items
    const rows = document.querySelectorAll('.minutes tbody tr');
    let hasMinutes = false;
    let minutesMarkdown = '';
    
    rows.forEach(row => {
      const topicInput = row.querySelector('td.topic .input-field');
      const topic = topicInput?.value || '';
      const type = row.querySelector('select[name="type"]')?.value || '';
      const note = row.querySelector('textarea[name="note"]')?.value || '';
      const owner = row.querySelector('input[name="owner"]')?.value || '';
      const dueAt = row.querySelector('input[name="dueAt"]')?.value || '';
      
      if (topic || note) {
        hasMinutes = true;
        minutesMarkdown += `### ${topic || 'Untitled'}\n\n`;
        if (type && type !== 'todo') minutesMarkdown += `**Type:** ${type}\n\n`;
        if (note) minutesMarkdown += `${note}\n\n`;
        if (owner) minutesMarkdown += `**Owner:** ${owner}\n\n`;
        if (dueAt) minutesMarkdown += `**Due:** ${dueAt}\n\n`;
        minutesMarkdown += '---\n\n';
      }
    });
    
    if (hasMinutes) {
      markdown += `## Minutes\n\n${minutesMarkdown}`;
    }
    
    return markdown;
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      // Show success feedback
      const button = document.getElementById('copy-markdown-btn');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      button.style.background = '#28a745';
      
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#007acc';
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      
      // Show feedback
      const button = document.getElementById('copy-markdown-btn');
      const originalText = button.textContent;
      button.textContent = 'Copied!';
      setTimeout(() => {
        button.textContent = originalText;
      }, 2000);
    }
  }
  
  // Markdown import functionality
  function setupMarkdownImport() {
    const importButton = document.getElementById('import-markdown-btn');
    const dialog = document.getElementById('import-dialog');
    const markdownInput = document.getElementById('markdown-input');
    const cancelButton = document.getElementById('cancel-import');
    const confirmButton = document.getElementById('confirm-import');
    
    if (!importButton || !dialog) return;

    // Open dialog
    importButton.addEventListener('click', function() {
      markdownInput.value = '';
      dialog.showModal();
      markdownInput.focus();
    });

    // Cancel import
    cancelButton.addEventListener('click', function() {
      dialog.close();
    });

    // Confirm import
    confirmButton.addEventListener('click', function() {
      const markdown = markdownInput.value.trim();
      if (markdown) {
        parseAndImportMarkdown(markdown);
        dialog.close();
      }
    });

    // Close on escape or backdrop click
    dialog.addEventListener('click', function(e) {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  }

  function parseAndImportMarkdown(markdown) {
    // Clear existing form
    clearForm();
    
    const lines = markdown.split('\n');
    let currentSection = '';
    let currentTopic = null;
    let topicContent = [];
    const topics = [];
    let attendeesList = [];
    let othersList = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Main headers
      if (line.startsWith('# ')) {
        const project = line.substring(2).trim();
        document.querySelector('input[name="project"]').value = project;
      }
      else if (line.startsWith('## ') && !line.includes('Minutes')) {
        const title = line.substring(3).trim();
        document.querySelector('input[name="title"]').value = title;
      }
      else if (line.startsWith('### Meeting Details')) {
        currentSection = 'details';
      }
      else if (line.startsWith('### Description')) {
        currentSection = 'description';
        topicContent = [];
      }
      else if (line.startsWith('## Minutes')) {
        currentSection = 'minutes';
        // Save any pending description before switching to minutes
        if (topicContent.length > 0) {
          const descElement = document.querySelector('textarea[name="description"]');
          if (descElement) {
            descElement.value = topicContent.join('\n').trim();
          }
        }
        topicContent = [];
      }
      else if (line.startsWith('### ') && currentSection === 'minutes') {
        // Save previous topic if exists
        if (currentTopic) {
          if (topicContent.length > 0) {
            currentTopic.note = topicContent.join('\n').trim();
          }
          topics.push(currentTopic);
        }
        // Start new topic
        currentTopic = {
          topic: line.substring(4).trim(),
          type: 'todo',
          note: '',
          owner: '',
          dueAt: ''
        };
        topicContent = [];
      }
      else if (line.startsWith('**Date/Time:**')) {
        const dateStr = line.substring(14).trim();
        // Try to parse and convert back to datetime-local format
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          const hours = String(date.getHours()).padStart(2, '0');
          const minutes = String(date.getMinutes()).padStart(2, '0');
          const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;
          document.querySelector('input[name="heldAt"]').value = formattedDate;
        }
      }
      else if (line.startsWith('**Location:**')) {
        const place = line.substring(13).trim();
        document.querySelector('input[name="place"]').value = place;
      }
      else if (line.startsWith('**Minute Taker:**')) {
        const taker = line.substring(17).trim();
        document.querySelector('input[name="minuteTaker"]').value = taker;
      }
      else if (line.startsWith('**Attendees:**')) {
        currentSection = 'attendees';
        attendeesList = [];
      }
      else if (line.startsWith('**Others:**')) {
        // Save attendees if we were collecting them
        if (attendeesList.length > 0) {
          const attendeesText = attendeesList.join('\n');
          document.querySelector('textarea[name="attendees"]').value = attendeesText;
        }
        currentSection = 'others';
        othersList = [];
      }
      else if (line.startsWith('**Type:**') && currentTopic) {
        currentTopic.type = line.substring(9).trim();
      }
      else if (line.startsWith('**Owner:**') && currentTopic) {
        currentTopic.owner = line.substring(10).trim();
      }
      else if (line.startsWith('**Due:**') && currentTopic) {
        currentTopic.dueAt = line.substring(8).trim();
      }
      else if (line.startsWith('- ') && currentSection === 'attendees') {
        attendeesList.push(line.substring(2).trim());
      }
      else if (line.startsWith('- ') && currentSection === 'others') {
        othersList.push(line.substring(2).trim());
      }
      else if (line === '---' && currentSection === 'minutes') {
        // End of current topic - save the note content
        if (currentTopic && topicContent.length > 0) {
          currentTopic.note = topicContent.join('\n').trim();
        }
        topicContent = [];
      }
      else if (currentSection === 'description' && line) {
        topicContent.push(line);
      }
      else if (currentSection === 'minutes' && currentTopic && line && !line.startsWith('**')) {
        // Collect content for current topic (but skip bold fields)
        topicContent.push(line);
      }
      else if (!line) {
        // Empty line - could be end of a section
        continue;
      }
    }
    
    // Handle final sections
    if (attendeesList.length > 0) {
      const attendeesText = attendeesList.join('\n');
      document.querySelector('textarea[name="attendees"]').value = attendeesText;
    }
    if (othersList.length > 0) {
      const othersText = othersList.join('\n');
      document.querySelector('textarea[name="others"]').value = othersText;
    }
    if (currentSection === 'description' && topicContent.length > 0) {
      const descText = topicContent.join('\n').trim();
      document.querySelector('textarea[name="description"]').value = descText;
    }
    if (currentSection === 'minutes' && currentTopic) {
      if (topicContent.length > 0) {
        currentTopic.note = topicContent.join('\n').trim();
      }
      topics.push(currentTopic);
    }
    
    
    // Import topics into table
    if (topics.length > 0) {
      console.log('Topics to import:', topics); // Debug
      importTopicsToTable(topics);
    } else {
      console.log('No topics found to import'); // Debug
    }
    
    // Show success message
    const importButton = document.getElementById('import-markdown-btn');
    const originalText = importButton.textContent;
    importButton.textContent = 'Imported!';
    importButton.style.background = '#28a745';
    
    setTimeout(() => {
      importButton.textContent = originalText;
      importButton.style.background = '#28a745';
    }, 2000);
  }

  function clearForm() {
    // Clear all input fields
    document.querySelectorAll('input, textarea, select').forEach(element => {
      if (element.type !== 'button' && element.type !== 'submit') {
        element.value = '';
      }
    });
    
    // Clear table except first row
    const tbody = document.querySelector('.minutes tbody');
    if (tbody && tbody.children.length > 1) {
      while (tbody.children.length > 1) {
        tbody.removeChild(tbody.lastChild);
      }
      // Clear first row
      const firstRow = tbody.children[0];
      firstRow.querySelectorAll('input, textarea, select').forEach(el => {
        el.value = '';
      });
    }
  }

  function importTopicsToTable(topics) {
    const tbody = document.querySelector('.minutes tbody');
    if (!tbody) return;
    
    // Store template row before clearing
    const templateRow = tbody.querySelector('tr').cloneNode(true);
    
    // Clear existing rows
    tbody.innerHTML = '';
    
    topics.forEach((topic, index) => {
      const row = createRowFromData(topic, templateRow);
      tbody.appendChild(row);
    });
    
    // Add one empty row at the end
    window.addNewRow();
  }

  function createRowFromData(data, templateRow) {
    // Use the provided template row or get one from the table
    const template = templateRow || document.querySelector('.minutes tbody tr');
    if (!template) return null;
    
    const newRow = template.cloneNode(true);
    
    // Clear the row first
    newRow.querySelectorAll('input, textarea, select').forEach(el => {
      el.value = '';
    });
    
    // Fill with data
    const topicInput = newRow.querySelector('td.topic .input-field');
    if (topicInput) topicInput.value = data.topic || '';
    
    const typeSelect = newRow.querySelector('select[name="type"]');
    if (typeSelect) typeSelect.value = data.type || 'todo';
    
    const noteTextarea = newRow.querySelector('textarea[name="note"]');
    if (noteTextarea) noteTextarea.value = data.note || '';
    
    const ownerInput = newRow.querySelector('input[name="owner"]');
    if (ownerInput) ownerInput.value = data.owner || '';
    
    const dueInput = newRow.querySelector('input[name="dueAt"]');
    if (dueInput) dueInput.value = data.dueAt || '';
    
    // Setup row events
    setupRowEvents(newRow);
    
    return newRow;
  }
  
});

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
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .project-row .input-field {
    flex: 1;
  }
  
  .copy-markdown-btn,
  .import-markdown-btn {
    background: #007acc;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    transition: background-color 0.2s;
  }
  
  .import-markdown-btn {
    background: #28a745;
  }
  
  .copy-markdown-btn:hover {
    background: #005a9e;
  }
  
  .import-markdown-btn:hover {
    background: #218838;
  }
  
  .copy-markdown-btn:active {
    background: #004578;
  }
  
  .import-markdown-btn:active {
    background: #1e7e34;
  }
  
  .copy-markdown-btn:focus,
  .import-markdown-btn:focus {
    outline: 2px solid #007acc;
    outline-offset: 2px;
  }
  
  /* Dialog styles */
  #import-dialog {
    border: none;
    border-radius: 8px;
    padding: 0;
    max-width: 600px;
    width: 90vw;
    max-height: 80vh;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  
  #import-dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }
  
  .dialog-content {
    padding: 24px;
  }
  
  .dialog-content h3 {
    margin: 0 0 8px 0;
    color: #333;
  }
  
  .dialog-content p {
    margin: 0 0 16px 0;
    color: #666;
  }
  
  #markdown-input {
    width: 100%;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 12px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    resize: vertical;
    margin-bottom: 16px;
    box-sizing: border-box;
  }
  
  #markdown-input:focus {
    outline: 2px solid #007acc;
    outline-offset: 1px;
    border-color: #007acc;
  }
  
  .dialog-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
  
  .dialog-buttons button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }
  
  #cancel-import {
    background: #6c757d;
    color: white;
  }
  
  #cancel-import:hover {
    background: #5a6268;
  }
  
  #confirm-import {
    background: #28a745;
    color: white;
  }
  
  #confirm-import:hover {
    background: #218838;
  }
`;
document.head.appendChild(style);
