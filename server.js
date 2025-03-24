const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware to parse JSON and allow CORS
app.use(express.json());
app.use(cors());

// In-memory storage for authorized devices (replace with a database in production)
const authorizedDevices = new Set();

// Endpoint to check if a device is authorized
app.get('/check-access', (req, res) => {
    const deviceId = req.query.deviceId;

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    if (authorizedDevices.has(deviceId)) {
        res.json({ authorized: true });
    } else {
        res.json({ authorized: false });
    }
});

// Endpoint to authorize a device (to be called from your dashboard)
app.post('/authorize-device', (req, res) => {
    const deviceId = req.body.deviceId;

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    authorizedDevices.add(deviceId);
    res.json({ message: 'Device authorized successfully' });
});

// Endpoint to revoke access for a device (to be called from your dashboard)
app.post('/revoke-access', (req, res) => {
    const deviceId = req.body.deviceId;

    if (!deviceId) {
        return res.status(400).json({ error: 'Device ID is required' });
    }

    authorizedDevices.delete(deviceId);
    res.json({ message: 'Device access revoked successfully' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});