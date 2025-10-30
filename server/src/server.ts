import app from './app';
import connectDB from './utils/db';

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB(); // Wait for DB connection
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();



