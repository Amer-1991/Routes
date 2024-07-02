document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('stockForm');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const stockSymbol = document.getElementById('stockSymbol').value.trim();
        const predictionMethod = document.getElementById('predictionMethod').value;
        const startDate = document.getElementById('startDate').value;
        const endDate = document.getElementById('endDate').value;

        if (!stockSymbol || !predictionMethod || !startDate || !endDate) {
            console.error("Incomplete form submission.");
            document.getElementById('predictionResults').innerHTML = `<div class="alert alert-danger">Please complete all fields.</div>`;
            return;
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(startDate) || !dateRegex.test(endDate) || new Date(startDate) > new Date(endDate)) {
            console.error("Invalid date range.");
            document.getElementById('predictionResults').innerHTML = `<div class="alert alert-danger">Invalid date range. Please enter valid start and end dates.</div>`;
            return;
        }

        fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stockSymbol: stockSymbol, predictionMethod: predictionMethod, startDate: startDate, endDate: endDate })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Service temporarily unavailable. Please try again later.');
            }
            return response.json();
        })
        .then(data => {
            displayPredictionResults(data);
        })
        .catch(error => {
            console.error("Failed to fetch prediction data:", error.message);
            console.error(error.stack);
            document.getElementById('predictionResults').innerHTML = `<div class="alert alert-danger">Error: Unable to fetch data. Please try again later.</div>`;
        });
    });

    document.getElementById('compareButton').addEventListener('click', function() {
        const stockSymbol = document.getElementById('stockSymbol').value.trim();
        if (!stockSymbol) {
            alert('Please enter a stock symbol for comparison.');
            return;
        }

        fetch(`/compare?stockSymbol=${stockSymbol}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Service temporarily unavailable. Please try again later.');
                }
                return response.json();
            })
            .then(data => {
                displayComparisonResults(data);
            })
            .catch(error => {
                console.error("Failed to fetch real-time price:", error.message);
                console.error(error.stack);
                document.getElementById('predictionResults').innerHTML = `<div class="alert alert-danger">Error: Unable to fetch real-time price. Please try again later.</div>`;
            });
    });

    function displayPredictionResults(data) {
        const resultsContainer = document.getElementById('predictionResults');
        if (data.error) {
            console.error("Error fetching prediction data:", data.error);
            resultsContainer.innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        } else {
            // Formatting the prediction results for better readability
            let formattedResults = `<div class="alert alert-success"><ul>`;
            formattedResults += `<li>Next Day: ${data.predictions.nextDay.toFixed(2)}</li>`;
            formattedResults += `<li>Next Week: ${data.predictions.nextWeek.toFixed(2)}</li>`;
            formattedResults += `<li>Next Month: ${data.predictions.nextMonth.toFixed(2)}</li>`;
            formattedResults += `</ul></div>`;
            resultsContainer.innerHTML = formattedResults;
        }
    }

    function displayComparisonResults(data) {
        if (data.error) {
            console.error("Error fetching real-time price:", data.error);
            document.getElementById('predictionResults').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        } else {
            document.getElementById('predictionResults').innerHTML += `<div class="alert alert-info">Real-time Price: ${data.realTimePrice.toFixed(2)}</div>`;
        }
    }
});