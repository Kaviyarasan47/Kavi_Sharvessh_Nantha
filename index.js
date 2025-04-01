const { MongoClient } = require('mongodb');

const drivers = [
    {
        name: "John Doe",
        vehicleType: "Sedan",
        isAvailable: true, 
        rating: 4.8
    },
    {
        name: "Alice Smith",
        vehicleType: "SUV",
        isAvailable: false,
        rating: 4.5
    }
];

// show the data in console
console.log(drivers);

// TODO: show all the drivers name in the console
drivers.forEach(driver => {
    console.log(`Driver: ${driver.name}`);
});
// TODO: add additional driver to the drivers array
drivers.push({ name: "Emma Brown", rating: 4.6, available: true });

console.log("New driver added:", drivers[drivers.length - 1]);

async function main() {
    // Replace <connection-string> with your MongoDB URI
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const db = client.db("testDB");
        const collection = db.collection("drivers");

        // ✅ Insert all drivers into MongoDB
        const result = await collection.insertMany(drivers);
        console.log(`✅ Inserted ${result.insertedCount} drivers!`);

         // ✅ Fetch all drivers to confirm insertion
        const allDrivers = await collection.find().toArray();
        console.log("📜 All Drivers in DB:", allDrivers);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

main();