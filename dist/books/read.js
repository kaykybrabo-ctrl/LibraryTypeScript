"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
const connection_1 = require("../DB/connection");
async function read(_req, res) {
    try {
        const books = await (0, connection_1.executeQuery)('SELECT * FROM books');
        res.json(books);
    }
    catch (err) {
        res.status(500).send('Failed to fetch books');
    }
}
