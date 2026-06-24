// Vercel Serverless Function entry point
// This wraps the Express app so Vercel can invoke it as a serverless function
const app = require('../server/server.js');

module.exports = app;
