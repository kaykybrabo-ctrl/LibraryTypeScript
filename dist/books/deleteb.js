"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteB = deleteB;
const connection_1 = require("../DB/connection");
async function deleteB(req, res) {
    const book_id = parseInt(req.params.id);
    if (isNaN(book_id)) {
        return res.status(400).send();
    }
    try {
        await (0, connection_1.executeQuery)('DELETE FROM books WHERE book_id = ?', [book_id]);
        res.sendStatus(200);
    }
    catch (err) {
        res.status(500).send();
    }
}
