# Stock Prediction Application

An online platform that provides future stock price predictions based on historical data up to 5 years, using the Alpha Vantage API. The application supports various forecasting techniques and does not require user authentication for accessing the predictions.

## Overview

The application is structured into a backend and a frontend. The backend, built on Node.js with Express, handles API requests, integrates with the Alpha Vantage API for stock data, and uses MongoDB with Mongoose for data management. The frontend is developed using EJS, Bootstrap, and JavaScript, offering a responsive interface for user interactions.

## Features

- Stock price prediction for any entered stock symbol without user authentication.
- Selection of prediction methods and custom historical periods for generating forecasts.
- Comparison of predicted prices with real-time data to validate predictions.

## Getting Started

### Requirements

- Node.js
- MongoDB
- npm (Node package manager)

### Quickstart

1. Clone the repository to your local machine.
2. Install dependencies with `npm install`.
3. Configure the environment variables in `.env` based on `.env.example`.
4. Launch the application using `npm start` and visit `http://localhost:3000` in a web browser.

### License

Copyright (c) 2024.