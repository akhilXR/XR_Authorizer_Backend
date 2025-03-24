const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection string (replace with your Atlas connection string)
const uri = "mongodb+srv://akhilm:PBCggEgup3hyxImC@cluster0.xuxyj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware to parse JSON and allow CORS
app.use(express.json());
app.use(cors());

// Connect to MongoDB
let db;
async function connectToDatabase() {
    try {
        await client.connect();
        db = client.db('deviceAuthDB'); // Replace with your database name
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    }
}

// Endpoint to check if a device is authorized
app.get('/check-access', async (req, res) => {
    const deviceId = req.query.deviceId;

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    try {
        const device = await db.collection('devices').findOne({ deviceId });
        if (device) {
            res.json({ authorized: device.state === 'authorized', state: device.state });
        } else {
            res.json({ authorized: false, state: 'not_found' });
        }
    } catch (err) {
        console.error('Error checking access:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint to authorize a device (to be called from your dashboard)
app.post('/authorize-device', async (req, res) => {
    const { deviceId, state = 'authorized' } = req.body; // Default state to "authorized"

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    try {
        await db.collection('devices').updateOne(
            { deviceId },
            { $set: { state, authorizedAt: new Date() } }, // Add state and timestamp
            { upsert: true } // Create if not exists
        );
        res.json({ message: 'Device authorized successfully' });
    } catch (err) {
        console.error('Error authorizing device:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Endpoint to revoke access for a device (to be called from your dashboard)
app.post('/revoke-access', async (req, res) => {
    const deviceId = req.body.deviceId;

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    try {
        await db.collection('devices').updateOne(
            { deviceId },
            { $set: { state: 'revoked', revokedAt: new Date() } }
        );
        res.json({ message: 'Device access revoked successfully' });
    } catch (err) {
        console.error('Error revoking access:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Connect to MongoDB when the server starts
connectToDatabase();