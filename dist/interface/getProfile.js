"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfile = getProfile;
const connection_1 = require("../DB/connection");
async function getProfile(req, res) {
    const username = req.query.username;
    if (!username)
        return res.status(400).json({ error: 'Username is required' });
    try {
        const results = await (0, connection_1.executeQuery)('SELECT photo AS profile_image, description FROM users WHERE username = ? LIMIT 1', [username]);
        if (!results.length)
            return res.status(404).json({ error: 'User not found' });
        const user = results[0];
        res.json({
            profile_image: user.profile_image || 'default-user.png',
            description: user.description || ''
        });
    }
    catch {
        res.status(500).json({ error: 'Database error' });
    }
}
