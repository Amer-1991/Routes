import requests
from bs4 import BeautifulSoup
import logging

logging.basicConfig(filename='logs/scrape.log', level=logging.INFO)

def scrape_new_website():
    url = "http://new-website.com/opportunities"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses
        soup = BeautifulSoup(response.text, 'html.parser')
        
        opportunities = []
        for opp in soup.find_all('div', class_='opportunity'):
            name = opp.find('h2').text.strip()
            provider = opp.find('span', class_='provider').text.strip()
            target_amount = float(opp.find('span', class_='target_amount').text.strip())
            ROI = float(opp.find('span', class_='ROI').text.strip())
            APR = float(opp.find('span', class_='APR').text.strip())
            
            opportunities.append({
                'name': name,
                'provider': provider,
                'target_amount': target_amount,
                'ROI': ROI,
                'APR': APR
            })

        logging.info('Successfully scraped new website for investment opportunities.')
        return opportunities

    except requests.RequestException as e:
        logging.error(f"Error fetching data from new website: {str(e)}")
        logging.error('Error stack:', exc_info=True)
        return []