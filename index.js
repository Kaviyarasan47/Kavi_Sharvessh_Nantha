const { MongoClient } = require('mongodb');

const drivers = [
    { name: "John Doe", vehicleType: "Sedan", isAvailable: true, rating: 4.8 },
    { name: "Alice Smith", vehicleType: "SUV", isAvailable: false, rating: 4.5 }
];

// Show initial drivers
console.log("📋 Initial Drivers:", drivers);

// Add a new driver
drivers.push({ name: "Emma Brown", vehicleType: "Hatchback", isAvailable: true, rating: 4.6 });
console.log("✅ New Driver Added:", drivers[drivers.length - 1]);

async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB!");

        const db = client.db("testDB");
        const collection = db.collection("drivers");

        // Clear existing collection to avoid duplicate entries
        await collection.deleteMany({});
        
        // Insert drivers into MongoDB
        await collection.insertMany(drivers);
        console.log(`🚀 Inserted ${drivers.length} drivers!`);

        // Query high-rated drivers (rating ≥ 4.5)
        const highRatedDrivers = await collection.find({ rating: { $gte: 4.5 } }).toArray();
        console.log("🏆 High Rated Drivers:", highRatedDrivers);

        // **Task 5: Update John Doe’s rating (+0.1)**
        const updateResult = await collection.updateOne(
            { name: "John Doe" },  // Filter
            { $inc: { rating: 0.1 } } // Update operation
        );

        if (updateResult.modifiedCount > 0) {
            console.log("✅ Updated John Doe's rating!");
        } else {
            console.log("⚠️ John Doe not found or rating unchanged.");
        }

        // Check updated rating
        const updatedJohnDoe = await collection.findOne({ name: "John Doe" });
        console.log("🔄 Updated John Doe:", updatedJohnDoe);

        // **Task 6: Delete unavailable drivers using the provided line**
        const deleteResult = await db.collection('drivers').deleteOne({ isAvailable: false });
        console.log(`Driver deleted with result: ${deleteResult.deletedCount} driver(s) deleted!`);

    } catch (err) {
        console.error("❌ Error:", err);
    } finally {
        await client.close();
    }
}

main();