// This file is responsible for handling the frontend filtering functionality for investment opportunities.
document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');
    const tableBody = document.getElementById('opportunitiesBody');

    function displayErrorMessage(message) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">${message}</td></tr>`;
    }

    function validateInput(input, regex, errorSpan, errorMessage) {
        if (input.value.trim() === '') {
            errorSpan.innerHTML = '';
            return true; // Allow empty input to pass validation
        }
        if (!regex.test(input.value.trim())) {
            errorSpan.innerHTML = errorMessage;
            return false;
        } else {
            errorSpan.innerHTML = '';
            return true;
        }
    }

    filterForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const durationRegex = /^\d+$/; // Only digits
        const alphaNumericAndArabicRegex = /^[a-zA-Z0-9\s\u0600-\u06FF]+$/; // Alphanumeric, space, and Arabic characters

        const durationValid = validateInput(document.getElementById('durationFilter'), durationRegex, document.querySelector('#durationFilter + .error-message'), 'Duration must be numeric.');
        const nameValid = validateInput(document.getElementById('nameFilter'), alphaNumericAndArabicRegex, document.querySelector('#nameFilter + .error-message'), 'Name must be alphanumeric or Arabic.');
        const providerValid = validateInput(document.getElementById('providerFilter'), alphaNumericAndArabicRegex, document.querySelector('#providerFilter + .error-message'), 'Provider must be alphanumeric or Arabic.');
        const statusValid = validateInput(document.getElementById('statusFilter'), alphaNumericAndArabicRegex, document.querySelector('#statusFilter + .error-message'), 'Status must be alphanumeric or Arabic.');
        const typeValid = validateInput(document.getElementById('typeFilter'), alphaNumericAndArabicRegex, document.querySelector('#typeFilter + .error-message'), 'Type must be alphanumeric or Arabic.');

        if (durationValid && nameValid && providerValid && statusValid && typeValid) {
            const formData = new FormData(filterForm);
            const queryParameters = new URLSearchParams();

            for (const [key, value] of formData.entries()) {
                if (value) {
                    queryParameters.append(key, value);
                }
            }

            fetch(`/api/opportunities?${queryParameters.toString()}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    tableBody.innerHTML = ''; // Clear previous results
                    if (data.length === 0) {
                        displayErrorMessage('No investment opportunities available.');
                    } else {
                        data.forEach(opportunity => {
                            const row = document.createElement('tr');
                            row.innerHTML = `
                                <td>${opportunity.duration}</td>
                                <td>${opportunity.opportunityName}</td>
                                <td>${opportunity.provider}</td>
                                <td>${opportunity.minimumAmountPerShare}</td>
                                <td>${new Date(opportunity.timeToOpen).toLocaleDateString()} ${new Date(opportunity.timeToOpen).toLocaleTimeString()}</td>
                                <td>${opportunity.status}</td>
                                <td>${opportunity.type}</td>
                                <td>${Math.floor(opportunity.targetAmount)} ريال</td>
                                <td>${opportunity.ROI.toFixed(2)}%</td>
                                <td>${opportunity.APR.toFixed(2)}%</td>
                            `;
                            tableBody.appendChild(row);
                        });
                    }
                })
                .catch(error => {
                    console.error('Error loading the opportunities:', error);
                    displayErrorMessage('Error loading investment opportunities. Please try again later.');
                });
        } else {
            console.log('Validation failed. Please correct the input fields.');
        }
    });
});