"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.read = read;
const connection_1 = require("../DB/connection");
async function read(_req, res) {
    try {
        const authors = await (0, connection_1.executeQuery)('SELECT * FROM authors');
        res.json(authors);
    }
    catch (err) {
        res.status(500).send();
    }
}
