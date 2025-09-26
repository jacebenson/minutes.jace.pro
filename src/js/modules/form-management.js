// Form management module
import { getDefaultMeetingTime } from './date-utils.js';

export function setupNewFormButton() {
  const newButton = document.getElementById('new-form-btn');
  const dialog = document.getElementById('reset-dialog');
  const cancelButton = document.getElementById('cancel-reset');
  const confirmButton = document.getElementById('confirm-reset');
  
  if (!newButton || !dialog) return;

  // Open confirmation dialog
  newButton.addEventListener('click', function() {
    dialog.showModal();
  });

  // Cancel reset
  cancelButton.addEventListener('click', function() {
    dialog.close();
  });

  // Confirm reset
  confirmButton.addEventListener('click', function() {
    clearForm();
    resetToDefaults();
    dialog.close();
    
    // Show success feedback
    const originalText = newButton.textContent;
    newButton.textContent = 'Cleared!';
    newButton.style.background = '#28a745';
    
    setTimeout(() => {
      newButton.textContent = originalText;
      newButton.style.background = '#dc3545';
    }, 2000);
  });

  // Close on escape or backdrop click
  dialog.addEventListener('click', function(e) {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}

function resetToDefaults() {
  // Reset date/time to current time rounded to previous 15-minute interval
  const dateTimeInput = document.querySelector('input[name="heldAt"]');
  if (dateTimeInput) {
    dateTimeInput.value = getDefaultMeetingTime();
  }
  
  // Focus the project input
  const projectInput = document.querySelector('input[name="project"]');
  if (projectInput) {
    projectInput.focus();
  }
  
  // Ensure default row exists in table
  const tbody = document.querySelector('.minutes tbody');
  if (tbody && tbody.children.length === 0) {
    if (window.addNewRow) {
      window.addNewRow();
    }
  }
}

export function clearForm() {
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