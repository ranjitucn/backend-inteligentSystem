const xlsx = require("xlsx");
const { MongoClient } = require("mongodb");

// MongoDB Atlas URI
const uri = 'mongodb+srv://ranjitdas:ranjitdas@ranjitdas.unf745o.mongodb.net/?retryWrites=true&w=majority&appName=ranjitdas';
const dbName = 'ranjitdas';
const collectionName = 'earthquakes';

// Read the Excel file
const workbook = xlsx.readFile("earthquakes.xlsx");
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = xlsx.utils.sheet_to_json(sheet); // Converts Excel to JSON

async function insertData() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Optional: Clear existing collection (CAREFUL in production!)
    // await collection.deleteMany({});

    const result = await collection.insertMany(data);
    console.log(`✅ Successfully inserted ${result.insertedCount} records into MongoDB Atlas.`);
  } catch (err) {
    console.error("❌ Error inserting data:", err);
  } finally {
    await client.close();
  }
}

insertData();
