"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const connection_1 = require("../DB/connection");
async function create(req, res) {
    const { author_id, title } = req.body;
    if (!author_id || !title) {
        return res.status(400).send();
    }
    try {
        await (0, connection_1.executeQuery)('INSERT INTO books (author_id, title) VALUES (?, ?)', [author_id, title]);
        res.sendStatus(201);
    }
    catch (err) {
        res.status(500).send();
    }
}
