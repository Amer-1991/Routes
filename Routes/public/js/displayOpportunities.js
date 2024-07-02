document.addEventListener('DOMContentLoaded', function() {
    fetch('/api/opportunities')
    .then(response => {
        if (!response.ok) {
            console.error('Network response was not ok');
            handleError('Network response was not ok');
            return;
        }
        return response.json();
    })
    .then(data => {
        const tableBody = document.getElementById('opportunitiesBody');
        if (!data || data.length === 0) {
            console.log('No opportunities data received to display.');
            handleError('No investment opportunities available.');
            return;
        }
        tableBody.innerHTML = '';
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
                <td>${opportunity.targetAmount.toFixed(2)}</td>
                <td>${opportunity.ROI.toFixed(2)}%</td>
                <td>${opportunity.APR.toFixed(2)}%</td>
                <td>${opportunity.websiteSource}</td>
                <td>${opportunity.websiteId}</td>
            `;
            tableBody.appendChild(row);
        });
        console.log('Opportunities successfully loaded and displayed.');
    })
    .catch(error => {
        console.error('Error loading the opportunities:', error.message);
        handleError('Error loading investment opportunities. Please try again later.');
    });

    function handleError(errorMessage) {
        const tableBody = document.getElementById('opportunitiesBody');
        tableBody.innerHTML = '';
        const errorRow = document.createElement('tr');
        errorRow.innerHTML = `<td colspan="12" class="text-center">${errorMessage}</td>`;
        tableBody.appendChild(errorRow);
    }
});