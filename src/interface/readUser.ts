import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function read(req: Request, res: Response) {
    const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 5;
    const offset = Number(req.query.offset) >= 0 ? Number(req.query.offset) : 0;
    const search = req.query.search as string | undefined;

    try {
        const params: any[] = [];
        let query = 'SELECT * FROM books';
        if (search) {
            query += ' WHERE title LIKE ?';
            params.push(`%${search}%`);
        }
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const books = await executeQuery(query, params);
        res.json(books);
    } catch {
        res.sendStatus(500);
    }
}
