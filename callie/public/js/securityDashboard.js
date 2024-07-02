// Establish connection with the server using Socket.IO
const socket = io();

// Function to update student status
function updateStudentStatus(studentId, status) {
  socket.emit('updateStatus', { studentId, status });
  console.log(`Request to update status sent for student ID: ${studentId} with status: ${status}`);
}

// Listen for status updates from the server
socket.on('statusUpdated', (data) => {
  // Assuming there are HTML elements with IDs corresponding to student IDs to show status
  const statusElement = document.getElementById(`status-${data.studentId}`);
  if (statusElement) {
    statusElement.textContent = data.status;
    console.log(`Status updated on UI for student ID: ${data.studentId} to ${data.status}`);
  } else {
    console.error(`Element for student ID: ${data.studentId} not found. Ensure that the student data is correctly loaded and the DOM elements are properly generated.`);
  }
});

// Ensure that the DOM is fully loaded before attaching event listeners
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('[data-student-id]').forEach(button => {
    button.addEventListener('click', function() {
      const studentId = this.getAttribute('data-student-id');
      const status = this.getAttribute('data-status');
      updateStudentStatus(studentId, status);
      console.log(`Button clicked to update status for student ID: ${studentId} to ${status}`);
    });
  });
});