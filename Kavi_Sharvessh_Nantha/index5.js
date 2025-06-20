const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 3000;

// MongoDB setup
const client = new MongoClient('mongodb://localhost:27017');
let rides;

// Serve static files (dashboard.html) from "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    await client.connect();
    const db = client.db('testDB'); // Replace with your actual DB name if different
    rides = db.collection('Week7'); // Replace with your actual collection name

    // API route: GET /analytics/passengers
    app.get('/analytics/passengers', async (req, res) => {
      try {
        const result = await rides.aggregate([
          { $match: { status: 'completed' } },
          {
            $group: {
              _id: '$userName',
              totalRides: { $sum: 1 },
              totalFare: { $sum: '$fare' },
              avgDistance: { $avg: '$distance' }
            }
          },
          {
            $project: {
              _id: 0,
              name: '$_id',
              totalRides: 1,
              totalFare: 1,
              avgDistance: { $round: ['$avgDistance', 2] }
            }
          }
        ]).toArray();

        res.json(result);
      } catch (err) {
        console.error('Aggregation error:', err);
        res.status(500).send('Error fetching analytics');
      }
    });

    app.listen(port, () => {
      console.log(`✅ Server running at: http://localhost:${port}`);
      console.log(`📊 Visit: http://localhost:${port}/dashboard.html`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err);
  }
}

startServer();