"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = update;
const connection_1 = require("../DB/connection");
async function update(req, res) {
    const book_id = parseInt(req.params.id);
    const { title } = req.body;
    if (isNaN(book_id) || !title) {
        return res.status(400).send();
    }
    try {
        await (0, connection_1.executeQuery)('UPDATE books SET title = ? WHERE book_id = ?', [title, book_id]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send();
    }
}
