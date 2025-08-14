import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

console.log('Database config:', {
    host: dbConfig.host,
    user: dbConfig.user,
    database: dbConfig.database
});



export async function executeQuery<T = any>(query: string, params: any[] = []): Promise<T> {
    const connection = await mysql.createConnection(dbConfig);
    const [result] = await connection.execute(query, params);
    await connection.end();
    return result as T;
}
