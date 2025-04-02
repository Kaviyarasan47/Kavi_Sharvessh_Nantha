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

//show the data in the console
console.log(drivers);

// TODO: show all the drivers name in the console
drivers.forEach(driver => {
    console.log(`Driver: ${driver.name}`);
});


//TODO: add additional driver to the drivers array



async function main() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    console.time("Connection Time"); // Start timing

    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        console.timeEnd("Connection Time"); // Stop timing and print duration
        

        const db = client.db("testDB");
        const collection = db.collection("users");

        await collection.insertOne({ name: "Kaviyarasan", age: 22 });
        console.log("Document inserted!");

        const result = await collection.findOne({ name: "Kaviyarasan" });
        console.log("Query result:", result);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        await client.close();
    }
}

main();