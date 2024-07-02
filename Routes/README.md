# Routes

Routes is a web-based platform designed to showcase new investment opportunities in Saudi Arabia by scraping data from specified URLs. It allows users to view and filter these opportunities based on various attributes directly through their web browser without any need for registration.

## Overview

The application leverages Node.js with the Express framework for the backend, MongoDB for data management, and EJS for rendering pages. It employs a responsive design using Bootstrap to ensure usability on various devices. Key operations include data scraping, opportunity display, and dynamic user-driven filtering.

## Features

- **Data Scraping:** Automatic and manual data scraping from 'https://sukuk.sa/investor' and other specified URLs.
- **Investment Opportunities Display:** Users can view details such as duration, provider, minimum investment amount, and more.
- **Dynamic Filtering:** Opportunities can be filtered based on various criteria directly from the UI.
- **Responsive Design:** The site is responsive, making it accessible on desktops, tablets, and mobile devices.

## Getting Started

### Requirements

- Node.js
- MongoDB
- Internet connection for live data scraping

### Quickstart

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up the necessary environment variables by copying `.env.example` to `.env` and filling in the details.
4. Run the server using `npm start`.

### License

Copyright (c) 2024.