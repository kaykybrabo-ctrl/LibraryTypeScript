"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeQuery = executeQuery;
const promise_1 = __importDefault(require("mysql2/promise"));
const dbConfig = {
    host: 'db',
    user: 'root',
    password: '12345678',
    database: 'library1',
};
async function executeQuery(query, params) {
    const connection = await promise_1.default.createConnection(dbConfig);
    const [result] = await connection.execute(query, params);
    await connection.end();
    return result;
}
