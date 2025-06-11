const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://ranjitdas:ranjitdas@ranjitdas.unf745o.mongodb.net/?retryWrites=true&w=majority&appName=ranjitdas';
const client = new MongoClient(uri);
const dbName = 'ranjitdas';

// Route: Get all earthquake data
app.get('/api/all-earthquakes', async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('earthquakes');
    const allData = await collection.find({}).toArray();
    console.log(allData);
    return res.json(allData);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error fetching all data');
  }
});

// Route: Query earthquakes by date and geographic box
app.post('/api/earthquakes', async (req, res) => {
  const { startTime, endTime, startLat, endLat, startLon, endLon } = req.body;

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('earthquakes');

    const results = await collection.find({
      time: {
        $gte: new Date(startTime),
        $lte: new Date(endTime)
      },
      latitude: {
        $gte: parseFloat(startLat),
        $lte: parseFloat(endLat)
      },
      longitude: {
        $gte: parseFloat(startLon),
        $lte: parseFloat(endLon)
      }
    }).toArray();
    console.log(results);

    return res.json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error querying database');
  }
});

// Run the server
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
