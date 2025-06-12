const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = 'mongodb+srv://ranjitdas:ranjitdas@ranjitdas.unf745o.mongodb.net/?retryWrites=true&w=majority&appName=ranjitdas';
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true
});
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

  const startLatVal = parseFloat(startLat);
  const endLatVal = parseFloat(endLat);
  const startLonVal = parseFloat(startLon);
  const endLonVal = parseFloat(endLon);

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  console.log('Valores recibidos:', {
    start: {
      Year: startDate.getUTCFullYear(),
      Month: startDate.getUTCMonth() + 1,
      Day: startDate.getUTCDate()
    },
    end: {
      Year: endDate.getUTCFullYear(),
      Month: endDate.getUTCMonth() + 1,
      Day: endDate.getUTCDate()
    },
    Lat: { start: startLatVal, end: endLatVal },
    Long: { start: startLonVal, end: endLonVal }
  });

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('earthquakes');

    const results = await collection.aggregate([
      {
        $addFields: {
          fullDate: {
            $dateFromParts: {
              year: "$Year",
              month: "$Month",
              day: "$Day",
              hour: "$Hr",
              minute: "$mn",
              second: {
                $toInt: "$Sec"  // Si Sec puede ser decimal, usa `$toDouble` o `$round`
              }
            }
          }
        }
      },
      {
        $match: {
          fullDate: {
            $gte: startDate,
            $lte: endDate
          },
          Lat: {
            $gte: Math.min(startLatVal, endLatVal),
            $lte: Math.max(startLatVal, endLatVal)
          },
          Long: {
            $gte: Math.min(startLonVal, endLonVal),
            $lte: Math.max(startLonVal, endLonVal)
          }
        }
      }
    ]).toArray();

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
