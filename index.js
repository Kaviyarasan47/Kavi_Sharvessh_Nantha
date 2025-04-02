const { MongoClient } = require('mongodb');

async function main() {
    // Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27018";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db("testDB");
        const collection = db.collection("users");

        await collection.insertOne({ name: "Kaviyarasan", age: 22 });
        console.log("Document inserted!");

        const result = await collection.findOne({ name: "Kaviyarasan" });
        console.log("Query result:", result);
    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await client.close();
    }
}

main();