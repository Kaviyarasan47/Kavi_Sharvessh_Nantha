// ==========================
// SETUP
// ==========================

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const app = express();
const port = 3000;

app.use(express.json());

let db;

// Connect to MongoDB and Start Server
async function connectDB() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    db = client.db("rideHailingDB");
    console.log("✅ Connected to MongoDB");

    app.listen(port, () => {
      console.log(`🚀 Server running at http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
  }
}
connectDB();


// ==========================
// AUTHENTICATION (All Roles)
// ==========================

app.post('/auth/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) {
    return res.status(400).json({ error: "Missing email, password or role" });
  }

  let collection = db.collection(role + 's'); // 'users', 'drivers', or 'admins'
  const user = await collection.findOne({ email });

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  res.status(200).json({
    message: `Logged in as ${role}`,
    user: { id: user._id, name: user.name, role }
  });
});


// ==========================
// USERS
// ==========================

// Register a user
app.post('/users', async (req, res) => {
  try {
    const result = await db.collection('users').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "User registration failed" });
  }
});

// View a user's ride history
app.get('/users/:userId/rides', async (req, res) => {
  const { userId } = req.params;
  const rides = await db.collection('rides').find({ userId }).toArray();
  res.status(200).json(rides);
});


// ==========================
// DRIVERS
// ==========================

// Register a driver
app.post('/drivers', async (req, res) => {
  try {
    const result = await db.collection('drivers').insertOne({
      ...req.body,
      available: true,
      rating: 4.5
    });
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Driver registration failed" });
  }
});


// ==========================
// RIDES (User and Driver)
// ==========================

// Book a ride (user)
app.post('/rides', async (req, res) => {
  try {
    const ride = { ...req.body, status: 'requested' };
    const result = await db.collection('rides').insertOne(ride);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Booking failed" });
  }
});

// View available rides (for drivers)
app.get('/rides/available', async (req, res) => {
  const rides = await db.collection('rides').find({ status: 'requested' }).toArray();
  res.status(200).json(rides);
});

// View ride requests (same as available)
app.get('/rides/requests', async (req, res) => {
  const rides = await db.collection('rides').find({ status: 'requested' }).toArray();
  res.status(200).json(rides);
});

// Accept a ride (driver)
app.patch('/rides/:rideId/accept', async (req, res) => {
  const { rideId } = req.params;
  const result = await db.collection('rides').updateOne(
    { _id: new ObjectId(rideId) },
    { $set: { status: 'accepted' } }
  );
  result.modifiedCount
    ? res.status(200).json({ message: "Ride accepted" })
    : res.status(404).json({ error: "Ride not found" });
});

// Complete a ride (driver)
app.patch('/rides/:rideId/complete', async (req, res) => {
  const { rideId } = req.params;
  const result = await db.collection('rides').updateOne(
    { _id: new ObjectId(rideId) },
    { $set: { status: 'completed' } }
  );
  result.modifiedCount
    ? res.status(200).json({ message: "Ride completed" })
    : res.status(404).json({ error: "Ride not found" });
});

// Cancel a ride (user)
app.delete('/rides/:rideId', async (req, res) => {
  const { rideId } = req.params;
  const result = await db.collection('rides').deleteOne({ _id: new ObjectId(rideId) });
  result.deletedCount
    ? res.status(200).json({ message: "Ride cancelled" })
    : res.status(404).json({ error: "Ride not found" });
});


// ==========================
// ADMIN ROUTES
// ==========================

// View all users
app.get('/admin/users', async (req, res) => {
  const users = await db.collection('users').find().toArray();
  res.status(200).json(users);
});

// Add a user (admin)
app.post('/admin/users/:id', async (req, res) => {
  try {
    const result = await db.collection('users').insertOne(req.body);
    res.status(201).json({ id: result.insertedId });
  } catch (err) {
    res.status(400).json({ error: "Failed to add user" });
  }
});

// Remove a user (admin)
app.delete('/admin/users/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.collection('users').deleteOne({ _id: new ObjectId(id) });
  result.deletedCount
    ? res.status(204).send()
    : res.status(404).json({ error: "User not found" });
});

// Add a driver (admin)
app.post('/admin/drivers/:id', async (req, res) => {
  const result = await db.collection('drivers').insertOne(req.body);
  res.status(201).json({ id: result.insertedId });
});

// Remove a driver (admin)
app.delete('/admin/drivers/:id', async (req, res) => {
  const { id } = req.params;
  const result = await db.collection('drivers').deleteOne({ _id: new ObjectId(id) });
  result.deletedCount
    ? res.status(204).send()
    : res.status(404).json({ error: "Driver not found" });
});

// Monitor active rides (admin)
app.get('/admin/rides/active', async (req, res) => {
  const activeRides = await db.collection('rides').find({
    status: { $in: ['accepted', 'in-progress'] }
  }).toArray();
  res.status(200).json(activeRides);
});

// Delete a ride (admin)
app.delete('/admin/rides/:rideId', async (req, res) => {
  const { rideId } = req.params;
  const result = await db.collection('rides').deleteOne({ _id: new ObjectId(rideId) });
  result.deletedCount
    ? res.status(204).send()
    : res.status(404).json({ error: "Ride not found" });
});
