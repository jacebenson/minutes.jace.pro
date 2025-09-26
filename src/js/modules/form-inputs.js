// Form input enhancements module
import { getDefaultMeetingTime } from './date-utils.js';

export function setupInputElements() {
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
export function setupDateTimePicker() {
  const dateTimeInput = document.querySelector('input[name="heldAt"]');
  if (dateTimeInput && !dateTimeInput.value) {
    // Set default to current date and time rounded to previous 15-minute interval
    dateTimeInput.value = getDefaultMeetingTime();
  }
}