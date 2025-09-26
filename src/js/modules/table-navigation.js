// Table navigation and row management module

export function setupTableNavigation() {
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
  }
  
  function setupRowEvents(row) {
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

export function navigateToCell(table, rowIndex, cellIndex) {
  const rows = table.querySelectorAll('tbody tr');
  const targetRow = rows[rowIndex];
  if (!targetRow) return;
  
  const cells = targetRow.querySelectorAll('td');
  const targetCell = cells[cellIndex];
  if (!targetCell) return;
  
  const input = targetCell.querySelector('input, textarea, select');
  if (input) {
    input.focus();
  }
}

export function insertRowBelow(table, currentIndex) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.children);
  const templateRow = rows[0].cloneNode(true);
  
  clearRowContent(templateRow);
  
  if (currentIndex >= rows.length - 1) {
    tbody.appendChild(templateRow);
  } else {
    tbody.insertBefore(templateRow, rows[currentIndex + 1]);
  }
  
  setupRowEvents(templateRow);
}

export function insertRowAbove(table, currentIndex) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.children);
  const templateRow = rows[0].cloneNode(true);
  
  clearRowContent(templateRow);
  tbody.insertBefore(templateRow, rows[currentIndex]);
  setupRowEvents(templateRow);
}

export function deleteRow(table, currentIndex) {
  const tbody = table.querySelector('tbody');
  const rows = Array.from(tbody.children);
  
  if (rows.length > 1) {
    rows[currentIndex].remove();
  }
}

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
}

function setupRowEvents(row) {
  // Remove button
  const removeBtn = row.querySelector('[data-remove]');
  if (removeBtn) {
    removeBtn.addEventListener('click', function() {
      const tbody = row.closest('tbody');
      if (tbody.children.length > 1) {
        row.remove();
      }
    });
  }
}

export function setupRowActions() {
  // This function sets up row-specific actions that might be needed
  // Currently implemented within setupTableNavigation, but keeping for future expansion
}