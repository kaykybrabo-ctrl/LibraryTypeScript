"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const create_1 = require("./authors/create");
const read_1 = require("./authors/read");
const update_1 = require("./authors/update");
const deletea_1 = require("./authors/deletea");
const count_1 = require("./authors/count");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../FRONTEND')));
app.get('/authors', read_1.read);
app.post('/authors', create_1.create);
app.put('/authors/:id', update_1.update);
app.delete('/authors/:id', deletea_1.deleteA);
app.get('/authors/count', count_1.count);
app.get('/', (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../FRONTEND/authors.html'));
});
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
