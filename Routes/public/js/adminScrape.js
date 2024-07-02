document.getElementById('testScrapeButton').addEventListener('click', function() {
    fetch('/admin/python-scrape', {
        method: 'POST'
    })
    .then(response => response.text())
    .then(data => {
        console.log('Python scraping initiated: ' + data);
        alert('Python scraping initiated: ' + data);
    })
    .catch(error => {
        console.error('Error initiating Python scraping:', error.message, error.stack);
        alert('Error initiating Python scraping. Check console for details.');
    });
});