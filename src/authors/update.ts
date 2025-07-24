import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function update(req: Request, res: Response) {
    const id = Number(req.params.id);
    let { name_author } = req.body;

    if (!name_author || typeof name_author !== 'string' || name_author.trim() === '') {
        return res.sendStatus(400);
    }

    if (isNaN(id) || id <= 0) {
        return res.sendStatus(400);
    }

    name_author = name_author.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()).trim();

    try {
        const result = await executeQuery(
            'UPDATE authors SET name_author = ? WHERE author_id = ?',
            [name_author, id]
        );

        if ((result as any).affectedRows === 0) {
            return res.sendStatus(404);
        }

        res.sendStatus(200);
    } catch {
        res.sendStatus(500);
    }
}
