// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const stockRouter = require("./routes/stockRoutes"); // Corrected import for stockRouter

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL environment variable not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3001; // Changed port to 3001 to avoid EADDRINUSE error

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use('/public', express.static('public'));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Error event listener for non-route related server operations
app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Stock Routes
app.use('/api', stockRouter);

// Root path response
app.get("/", (req, res) => {
  res.render("index", { title: 'Stock Prediction' });
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});