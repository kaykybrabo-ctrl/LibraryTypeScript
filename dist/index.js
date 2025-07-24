"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const create_1 = require("./books/create");
const read_1 = require("./books/read");
const update_1 = require("./books/update");
const deleteb_1 = require("./books/deleteb");
const count_1 = require("./books/count");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.get('/books', read_1.read);
app.post('/books', create_1.create);
app.put('/books/:id', update_1.update);
app.delete('/books/:id', deleteb_1.deleteB);
app.get('/books/count', count_1.count);
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
