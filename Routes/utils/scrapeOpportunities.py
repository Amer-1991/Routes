import requests
from bs4 import BeautifulSoup
import pymongo
from pymongo import MongoClient
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# MongoDB client setup
mongo_connection_string = os.getenv('MONGO_CONNECTION_STRING')
client = MongoClient(mongo_connection_string)
db = client['routes']
investment_opportunities_collection = db['investment_opportunities']

def scrape_opportunities():
    try:
        url = 'https://sukuk.sa/investor'
        response = requests.get(url)
        response.raise_for_status()  # Raises an HTTPError for bad responses

        # Parse the HTML content
        soup = BeautifulSoup(response.text, 'html.parser')
        opportunities_section = soup.find('div', class_='investment-opportunities')

        # Extract opportunities
        opportunities = opportunities_section.find_all('div', class_='opportunity')
        for opportunity in opportunities:
            duration = opportunity.find('span', class_='duration').text.strip()
            opportunity_name = opportunity.find('h3', class_='name').text.strip()
            provider = 'صكوك'
            minimum_amount_per_share = float(opportunity.find('span', class_='min-amount').text.replace(',', ''))
            time_to_open = opportunity.find('span', class_='time-to-open').text.strip()
            status = opportunity.find('span', class_='status').text.strip()
            type_ = opportunity.find('span', class_='type').text.strip()
            target_amount = float(opportunity.find('span', class_='target-amount').text.replace(',', ''))
            roi = float(opportunity.find('span', class_='roi').text.strip('%'))
            apr = float(opportunity.find('span', class_='apr').text.strip('%'))

            # Create or update the database entry
            investment_opportunities_collection.update_one(
                {'opportunityName': opportunity_name, 'provider': provider},
                {'$set': {
                    'duration': duration,
                    'opportunityName': opportunity_name,
                    'provider': provider,
                    'minimumAmountPerShare': minimum_amount_per_share,
                    'timeToOpen': time_to_open,
                    'status': status,
                    'type': type_,
                    'targetAmount': target_amount,
                    'ROI': roi,
                    'APR': apr
                }},
                upsert=True
            )
        logging.info('Investment opportunities scraped and stored successfully.')

    except requests.RequestException as e:
        logging.error('Failed to fetch data from URL', exc_info=True)
    except pymongo.errors.PyMongoError as e:
        logging.error('MongoDB operation failed', exc_info=True)
    except Exception as e:
        logging.error('An unexpected error occurred during scraping', exc_info=True)

if __name__ == '__main__':
    scrape_opportunities()