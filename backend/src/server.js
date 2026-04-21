require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('[server] failed to start', err);
    process.exit(1);
  }
})();
