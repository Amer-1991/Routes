const socket = io();

socket.on('statusUpdated', (data) => {
  const studentsStatusDiv = document.getElementById('students-status');
  
  let statusElement = document.getElementById(`status-${data.studentId}`);
  if (!statusElement) {
    statusElement = document.createElement('div');
    statusElement.id = `status-${data.studentId}`;
    statusElement.className = 'status-div';
    studentsStatusDiv.appendChild(statusElement);
    console.log(`Created new status element for student ID: ${data.studentId} and appended to students-status div.`);
  }

  statusElement.className = `status-div status-${data.status.toLowerCase()}`;
  statusElement.textContent = `Student ID: ${data.studentId}, Status: ${data.status}`;
  console.log(`Updated UI for student ID: ${data.studentId} to status: ${data.status}`);
});