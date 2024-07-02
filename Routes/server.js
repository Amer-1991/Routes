// Load environment variables
require("dotenv-flow").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Importing admin routes
const apiRoutes = require('./routes/apiRoutes'); // Importing API routes for opportunities
const { scheduleScrapingTask } = require('./utils/scheduleScraping'); // Importing the scraping scheduler
const http = require('http');
const { spawn } = require('child_process');
const EventEmitter = require('events');

// Global event emitter for OTP handling
global.eventEmitter = new EventEmitter();

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;
const alternativePort = process.env.ALTERNATIVE_PORT || 3001;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
    scheduleScrapingTask(); // Scheduling the scraping task after successful database connection
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Admin Routes
app.use('/admin', adminRoutes); // Mounting admin routes

// API Routes for fetching opportunities
app.use('/api', apiRoutes); // Mounting API routes

// Root path response
app.get("/", (req, res) => {
  res.render("index");
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

// Server setup to handle EADDRINUSE error
const server = http.createServer(app);
let isClosing = false;

server.listen(port);
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use.`);
    if (!isClosing) {
      console.log(`Attempting to close the server and retry on alternative port ${alternativePort}.`);
      server.close(() => {
        isClosing = false;
        server.listen(alternativePort);
      });
      isClosing = true;
    } else {
      console.error("Failed to close the server properly.");
    }
  } else {
    console.error(`Server error: ${error.message}`);
    console.error(error.stack);
  }
});

server.on('listening', () => {
  const addr = server.address();
  console.log(`Server running at http://localhost:${addr.port}`);
});

// Function to restart the server
function restartServer() {
    console.log("Restarting server...");
    const subprocess = spawn(process.argv[0], process.argv.slice(1), {
        env: process.env,
        stdio: 'inherit',
        detached: true
    });
    subprocess.on('error', (error) => {
        console.error("Failed to restart server:", error);
    });
    subprocess.on('exit', (code, signal) => {
        console.log(`Server process exited with code ${code} and signal ${signal}`);
    });
    subprocess.unref();
    process.exit();
}

module.exports = { app, restartServer };