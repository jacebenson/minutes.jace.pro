// Keyboard shortcuts module
import { navigateToCell, insertRowBelow, insertRowAbove, deleteRow } from './table-navigation.js';

export function setupKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    const isWin = navigator.platform.indexOf('Win') > -1;
    const modKey = isWin ? e.altKey : e.metaKey;
    
    const table = document.querySelector('.minutes .table tbody');
    const currentCell = document.activeElement;
    
    // Handle Enter key for adding new rows (without modifier key)
    // Skip if we're in a textarea (allow normal line breaks)
    if (e.key === 'Enter' && !modKey && currentCell.closest('.minutes tbody') && currentCell.tagName !== 'TEXTAREA') {
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