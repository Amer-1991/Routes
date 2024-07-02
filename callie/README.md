# Callie

Callie is a web-based application designed to streamline the school pickup process by managing and displaying the status of students being picked up by parents or guardians. It serves as an interactive platform for schools to communicate efficiently with guardians and security personnel, ensuring a smooth and safe pickup operation.

## Overview

The application utilizes a backend built with Node.js and Express, and a frontend developed using EJS, Bootstrap, and Vanilla JavaScript. The system is supported by a MongoDB database, with Mongoose for data modeling. Real-time functionality is achieved using Socket.IO for live status updates across user roles.

## Features

- **User Roles**: Different access levels for Guardians, Super Admin, School Admin, and Security Guards.
- **Real-time Updates**: Live status updates on student pickup statuses, viewable on various interfaces.
- **Notifications**: Sound and visual alerts for status changes to keep all parties informed promptly.
- **Security and Data Integrity**: Secure login and session management, with role-based access control.

## Getting started

### Requirements

- Node.js
- MongoDB
- Environment setup with .env file based on provided .env.example

### Quickstart

1. Clone the repository.
2. Install dependencies with `npm install`.
3. Set up the .env file based on the .env.example.
4. Run the application using `npm start`. The application will be available at `http://localhost:3000`.

### License

Copyright (c) 2024.