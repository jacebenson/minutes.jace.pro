// Meta fields toggle functionality module

export function setupMetaFieldToggles() {
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