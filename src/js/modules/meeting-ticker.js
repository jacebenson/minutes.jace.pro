// Meeting ticker module - calculates meeting cost in real time

export function setupMeetingTicker() {
  let ticker = null;
  let startTime = null;
  let isRunning = false;
  
  const toggleButton = document.getElementById('meeting-ticker-toggle');
  const section = document.getElementById('meeting-ticker-section');
  const startButton = document.getElementById('start-ticker');
  const stopButton = document.getElementById('stop-ticker');
  const resetButton = document.getElementById('reset-ticker');
  const costDisplay = document.getElementById('cost-display');
  const durationDisplay = document.getElementById('duration-display');
  const attendeesInput = document.getElementById('ticker-attendees');
  const hourlyRateInput = document.getElementById('ticker-rate');
  const annualRateDisplay = document.getElementById('annual-rate-display');
  
  if (!toggleButton || !section) return;
  
  // Function to update annual rate display
  function updateAnnualRateDisplay() {
    if (!annualRateDisplay || !hourlyRateInput) return;
    
    const hourlyRate = parseFloat(hourlyRateInput.value) || 200;
    const annualRate = hourlyRate * 2080; // 2080 working hours per year (40 hrs/week × 52 weeks)
    const formattedAnnual = annualRate.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
    
    annualRateDisplay.textContent = `~${formattedAnnual}/year`;
  }
  
  // Watch for changes in hourly rate input
  if (hourlyRateInput) {
    hourlyRateInput.addEventListener('input', updateAnnualRateDisplay);
    hourlyRateInput.addEventListener('change', updateAnnualRateDisplay);
    // Initial update
    updateAnnualRateDisplay();
  }
  
  // Function to count attendees from the attendees textarea
  function countAttendeesFromText() {
    const attendeesTextarea = document.querySelector('textarea[name="attendees"]');
    if (!attendeesTextarea || !attendeesTextarea.value.trim()) {
      return 5; // Default fallback
    }
    
    const text = attendeesTextarea.value.trim();
    // Split by lines and filter out empty lines
    let lines = text.split('\n').filter(line => line.trim() !== '');
    
    // If it's all on one line, try splitting by common separators
    if (lines.length === 1) {
      const singleLine = lines[0];
      // Try splitting by comma, semicolon, or "and"
      if (singleLine.includes(',')) {
        lines = singleLine.split(',').filter(item => item.trim() !== '');
      } else if (singleLine.includes(';')) {
        lines = singleLine.split(';').filter(item => item.trim() !== '');
      } else if (singleLine.includes(' and ')) {
        lines = singleLine.split(' and ').filter(item => item.trim() !== '');
      }
    }
    
    return Math.max(1, lines.length); // At least 1 attendee
  }
  
  // Function to update attendee count
  function updateAttendeeCount() {
    const count = countAttendeesFromText();
    if (attendeesInput) {
      const oldValue = parseInt(attendeesInput.value) || 0;
      attendeesInput.value = count;
      
      // Visual feedback when count changes
      if (oldValue !== count && oldValue !== 0) {
        attendeesInput.style.backgroundColor = '#e7f3ff';
        attendeesInput.style.transition = 'background-color 0.3s ease';
        setTimeout(() => {
          attendeesInput.style.backgroundColor = '';
        }, 1000);
      }
    }
  }
  
  // Watch for changes in the attendees textarea
  const attendeesTextarea = document.querySelector('textarea[name="attendees"]');
  if (attendeesTextarea) {
    attendeesTextarea.addEventListener('input', updateAttendeeCount);
    attendeesTextarea.addEventListener('blur', updateAttendeeCount);
    // Initial count on page load
    updateAttendeeCount();
  }
  
  // Toggle section visibility
  toggleButton.addEventListener('click', function(e) {
    e.preventDefault();
    const isHidden = section.style.display === 'none';
    section.style.display = isHidden ? 'table-row' : 'none';
    toggleButton.textContent = isHidden ? 'Hide Cost Tracker' : 'Meeting Cost Tracker';
    
    // Update attendee count when opening the section
    if (isHidden) {
      updateAttendeeCount();
    }
    
    // Auto-start tracking if we have a meeting time and valid inputs
    if (isHidden && !isRunning) {
      const heldAtInput = document.querySelector('input[name="heldAt"]');
      const attendees = parseInt(attendeesInput.value) || 0;
      const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
      
      if (heldAtInput?.value && attendees > 0 && hourlyRate > 0) {
        // Small delay to let the section render
        setTimeout(() => {
          startButton.click();
        }, 100);
      }
    }
  });
  
  // Start ticker
  if (startButton) {
    startButton.addEventListener('click', function() {
      if (isRunning) return;
      
      const attendees = parseInt(attendeesInput.value) || 0;
      const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
      
      if (attendees <= 0 || hourlyRate <= 0) {
        alert('Please enter valid attendee count and hourly rate');
        return;
      }
      
      // Get the meeting start time from the heldAt field
      const heldAtInput = document.querySelector('input[name="heldAt"]');
      const heldAtValue = heldAtInput?.value;
      
      if (heldAtValue) {
        startTime = new Date(heldAtValue);
        // If the meeting time is in the future, use current time instead
        const now = new Date();
        if (startTime > now) {
          startTime = now;
        }
      } else {
        // Fallback to current time if no meeting time is set
        startTime = new Date();
      }
      
      isRunning = true;
      startButton.disabled = true;
      stopButton.disabled = false;
      
      ticker = setInterval(updateCost, 100);
    });
  }
  
  // Stop ticker
  if (stopButton) {
    stopButton.addEventListener('click', function() {
      if (!isRunning) return;
      
      clearInterval(ticker);
      ticker = null;
      isRunning = false;
      startButton.disabled = false;
      stopButton.disabled = true;
    });
  }
  
  // Reset ticker
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      if (ticker) clearInterval(ticker);
      ticker = null;
      isRunning = false;
      startTime = null;
      
      startButton.disabled = false;
      stopButton.disabled = true;
      
      if (costDisplay) {
        costDisplay.textContent = formatCurrency(0);
      }
      
      if (durationDisplay) {
        durationDisplay.textContent = formatDuration(0);
      }
    });
  }
  
  function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  }
  
  function updateCost() {
    if (!startTime || !isRunning) return;
    
    const attendees = parseInt(attendeesInput.value) || 0;
    const hourlyRate = parseFloat(hourlyRateInput.value) || 0;
    const now = new Date();
    const elapsedSeconds = (now - startTime) / 1000;
    
    // Don't show negative time if meeting hasn't started yet
    const actualElapsedSeconds = Math.max(0, elapsedSeconds);
    const cost = (hourlyRate * attendees * actualElapsedSeconds) / 3600;
    
    if (costDisplay) {
      costDisplay.textContent = formatCurrency(cost);
    }
    
    if (durationDisplay) {
      durationDisplay.textContent = formatDuration(actualElapsedSeconds);
    }
  }
  
  function formatCurrency(amount) {
    const formatted = amount.toFixed(2);
    return `$${formatted}`;
  }
}