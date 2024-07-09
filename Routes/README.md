# Routes

Routes is a web platform that showcases new investment opportunities in Saudi Arabia by scraping data from various URLs. It provides a responsive interface for users to view and filter investment opportunities, enhancing investment decision-making.

## Overview

Routes utilizes a classic web architecture with a Node.js/Express backend that manages business logic, data scraping, and storage. The frontend is built using Bootstrap and EJS for a responsive user interface. MongoDB is employed for data persistence, storing details of the scraped investment opportunities. The server-side rendering with EJS optimizes load times and SEO. Data freshness is maintained through periodic and manual scraping mechanisms implemented on the server.

### Technologies Used:
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Express**: A web application framework for Node.js.
- **MongoDB**: A NoSQL database used to store application data.
- **Mongoose**: An ODM (Object Data Modeling) library for MongoDB and Node.js.
- **EJS**: A templating language to generate HTML markup with plain JavaScript.
- **Axios**: A promise-based HTTP client for making requests.
- **Cheerio**: Implements core jQuery for the server to parse and manipulate HTML.
- **Dotenv**: Loads environment variables from a `.env` file.
- **Bootstrap**: Front-end framework for developing responsive web applications.

### Project Structure:
- `.env` and `.env.example`: Configuration files for setting up environment variables.
- `models/`: Contains Mongoose schemas for investment opportunities and users.
- `public/`: Contains static files like JavaScript and CSS.
- `routes/`: Defines routes for admin operations, API endpoints, and user authentication.
- `utils/`: Includes utility functions for scraping data and handling authentication.
- `views/`: EJS templates for rendering the UI.
- `server.js`: Entry point of the application, setting up the server and middleware.

## Features

- **Data Scraping**: Automatically scrapes investment opportunities from predefined URLs.
- **Dynamic Display**: Opportunities are displayed on the webpage and can be filtered based on different criteria.
- **Admin Panel**: Secure admin panel for managing scraping operations and updating URLs.
- **Responsive UI**: The interface adjusts for different device screens, ensuring a good user experience across devices.

## Getting Started

### Requirements
- Node.js installed on your machine.
- MongoDB set up locally or remotely.
- Access to terminal or command prompt.

### Quickstart
1. Clone the repository to your local machine.
2. Navigate to the project directory and install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env` file based on the `.env.example` template.
4. Start the server:
   ```bash
   npm run dev
   ```
5. Open your browser and go to `http://localhost:3700` to view the application.

### License
Copyright (c) 2024. All rights reserved.

This documentation provides a comprehensive overview to help new developers and users understand and operate the Routes platform efficiently.