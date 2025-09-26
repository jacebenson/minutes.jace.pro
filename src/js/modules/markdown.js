// Markdown functionality module
import { clearForm } from './form-management.js';

export function setupMarkdownCopy() {
  const copyButton = document.getElementById('copy-markdown-btn');
  if (!copyButton) return;

  copyButton.addEventListener('click', function() {
    const markdown = generateMarkdown();
    copyToClipboard(markdown);
  });
}

export function setupMarkdownImport() {
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
  if (formattedDate) markdown += `- Date/Time: ${formattedDate}\n`;
  if (place) markdown += `- Location: ${place}\n`;
  if (minuteTaker) markdown += `- Minute Taker: ${minuteTaker}\n`;
  markdown += '\n';
  
  // Attendees
  if (attendees) {
    markdown += `## Attendees\n\n`;
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
  
  // Meeting cost (if cost tracker is visible and has been used)
  const costSection = document.getElementById('meeting-ticker-section');
  const costDisplay = document.getElementById('cost-display');
  const durationDisplay = document.getElementById('duration-display');
  const attendeesInput = document.getElementById('ticker-attendees');
  const hourlyRateInput = document.getElementById('ticker-rate');
  
  if (costSection && costSection.style.display !== 'none') {
    // Check if cost tracker has been used (cost is not $0.00)
    const currentCost = costDisplay?.textContent || '$0.00';
    const currentDuration = durationDisplay?.textContent || '0s';
    
    if (currentCost !== '$0.00' || currentDuration !== '0s') {
      const attendeesCount = attendeesInput?.value || '0';
      const hourlyRate = hourlyRateInput?.value || '0';
      
      markdown += `### Meeting Cost\n\n`;
      markdown += `- Attendees: ${attendeesCount}\n`;
      markdown += `- Hourly Rate: $${hourlyRate}/hour per person\n`;
      markdown += `- Duration: ${currentDuration}\n`;
      markdown += `- **Total Cost: ${currentCost}**\n\n`;
    }
  }
  
  // Minutes/Action items
  const rows = document.querySelectorAll('.minutes tbody tr');
  let hasMinutes = false;
  let minutesMarkdown = '';
  
  rows.forEach((row, index) => {
    const topicInput = row.querySelector('td.topic .input-field');
    const topic = topicInput?.value || '';
    const type = row.querySelector('select[name="type"]')?.value || '';
    const note = row.querySelector('textarea[name="note"]')?.value || '';
    const owner = row.querySelector('input[name="owner"]')?.value || '';
    const dueAt = row.querySelector('input[name="dueAt"]')?.value || '';
    
    if (topic || note || owner || dueAt) {
      hasMinutes = true;
      minutesMarkdown += `### ${topic || 'Untitled'}\n\n`;
      
      if (owner) minutesMarkdown += `- Owner: ${owner}\n`;
      if (dueAt) minutesMarkdown += `- Due: ${dueAt}\n`;
      if (type && type !== 'todo') minutesMarkdown += `- Type: ${type}\n`;
      if (note) {
        // Handle multi-line notes with backslash line endings
        const noteLines = note.split('\n');
        if (noteLines.length === 1) {
          minutesMarkdown += `- Notes: ${note}\n`;
        } else {
          minutesMarkdown += `- Notes: ${noteLines[0]}`;
          for (let i = 1; i < noteLines.length; i++) {
            if (noteLines[i].trim()) {
              minutesMarkdown += `\\\n${noteLines[i]}`;
            } else {
              minutesMarkdown += `\\\n`;
            }
          }
          minutesMarkdown += '\n';
        }
      }
      
      minutesMarkdown += '\n---\n\n';
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
    else if (line.startsWith('## ') && !line.includes('Minutes') && !line.includes('Attendees') && !line.includes('Description')) {
      const title = line.substring(3).trim();
      document.querySelector('input[name="title"]').value = title;
    }
    else if (line.startsWith('### Meeting Details')) {
      currentSection = 'details';
    }
    else if (line.startsWith('## Description')) {
      currentSection = 'description';
      topicContent = [];
    }
    else if (line.startsWith('## Attendees')) {
      currentSection = 'attendees';
      attendeesList = [];
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
    else if (line.startsWith('- Date/Time:')) {
      const dateStr = line.substring(12).trim();
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
    else if (line.startsWith('- Location:')) {
      const place = line.substring(11).trim();
      document.querySelector('input[name="place"]').value = place;
    }
    else if (line.startsWith('- Minute Taker:')) {
      const taker = line.substring(15).trim();
      document.querySelector('input[name="minuteTaker"]').value = taker;
    }
    else if (line.startsWith('- Type:') && currentTopic) {
      currentTopic.type = line.substring(7).trim();
    }
    else if (line.startsWith('- Owner:') && currentTopic) {
      currentTopic.owner = line.substring(8).trim();
    }
    else if (line.startsWith('- Due:') && currentTopic) {
      currentTopic.dueAt = line.substring(6).trim();
    }
    else if (line.startsWith('- Notes:') && currentTopic) {
      // Handle multi-line notes with backslash line endings
      let noteContent = line.substring(8).trim();
      let noteLines = [noteContent];
      
      // Look ahead for continuation lines (lines that are continuations from backslash endings)
      let j = i + 1;
      while (j < lines.length) {
        const currentLineToCheck = lines[j - 1]; // The line we just processed
        const nextLine = lines[j].trim();
        
        // If the current line ends with backslash, the next line is a continuation
        if (currentLineToCheck.endsWith('\\')) {
          noteLines.push(nextLine);
          j++;
          i++; // Skip this line in the main loop
        } else {
          // No more continuation lines
          break;
        }
      }
      
      // Join all lines with newlines and remove backslashes
      currentTopic.note = noteLines.map(line => line.replace(/\\$/, '')).join('\n');
    }
    else if (line.startsWith('- ') && currentSection === 'attendees') {
      attendeesList.push(line.substring(2).trim());
    }
    else if (line === '---' && currentSection === 'minutes') {
      // End of current topic
      if (currentTopic) {
        topics.push(currentTopic);
        currentTopic = null;
      }
      topicContent = [];
    }
    else if (currentSection === 'description' && line && !line.startsWith('#')) {
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
  if (window.addNewRow) {
    window.addNewRow();
  }
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
  
  return newRow;
}