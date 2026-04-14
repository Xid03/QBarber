const dotenv = require('dotenv');

dotenv.config();

function getCorsOrigins() {
  return (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

module.exports = {
  getCorsOrigins
};
