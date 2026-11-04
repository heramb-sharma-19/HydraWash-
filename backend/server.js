require('dotenv').config();
const app = require('./src/app');
const { verifyConnection } = require('./src/config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await verifyConnection();            // exits with a helpful message if MySQL is unreachable
  app.listen(PORT, () => console.log(`HydraWash API running on http://localhost:${PORT}`));
})();
