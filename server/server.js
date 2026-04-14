require('./config/env');

const http = require('http');
const cors = require('cors');
const express = require('express');
const { Server } = require('socket.io');
const { connectDatabase } = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const apiRoutes = require('./routes');
const { getCorsOrigins } = require('./config/env');
const { startBookingAutomation } = require('./services/bookingAutomation');
const { registerSocketHandlers } = require('./socket');

const app = express();
const server = http.createServer(app);
const corsOrigins = getCorsOrigins();
let bookingAutomation = null;

const io = new Server(server, {
  cors: {
    origin: corsOrigins.length > 0 ? corsOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

registerSocketHandlers(io);

app.set('io', io);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || corsOrigins.length === 0 || corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Origin not allowed by CORS: ${origin}`));
    },
    credentials: true
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    websocket: 'ready',
    bookingAutomation: bookingAutomation ? 'running' : 'stopped'
  });
});

app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  const port = Number(process.env.PORT || 5000);

  await connectDatabase();
  bookingAutomation = startBookingAutomation(io);

  server.listen(port, () => {
    console.log(`QBarber API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

module.exports = {
  app,
  io,
  server,
  startServer
};
