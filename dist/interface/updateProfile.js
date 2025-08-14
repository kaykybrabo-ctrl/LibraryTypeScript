"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = updateProfile;
const connection_1 = require("../DB/connection");
async function updateProfile(req, res) {
    const { username, description } = req.body;
    if (!username)
        return res.status(400).json({ error: 'Username is required' });
    try {
        let imageFilename = req.file?.filename;
        if (!imageFilename) {
            const result = await (0, connection_1.executeQuery)('SELECT photo FROM users WHERE username = ? LIMIT 1', [username]);
            imageFilename = result.length > 0 ? result[0].photo : 'default-user.png';
        }
        await (0, connection_1.executeQuery)('UPDATE users SET photo = ?, description = ? WHERE username = ?', [imageFilename, description, username]);
        res.json({ profile_image: imageFilename, username, description });
    }
    catch {
        res.status(500).json({ error: 'Database error' });
    }
}
