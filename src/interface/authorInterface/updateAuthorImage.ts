import { Request, Response } from 'express';
import { executeQuery } from '../../DB/connection';
import path from 'path';
import fs from 'fs';

export async function updateAuthorImage(req: Request, res: Response) {
    const id = Number(req.params.id);
    const file = req.file;

    if (isNaN(id)) return res.status(400).json({ error: 'Invalid author ID' });

    try {
        let photo;
        if (file) {
            photo = file.filename;

            const old: any[] = await executeQuery('SELECT photo FROM authors WHERE author_id = ?', [id]);

            if (old.length && old[0].photo) {
                const oldPath = path.join(__dirname, '../../../FRONTEND/uploads', old[0].photo);
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }

            await executeQuery('UPDATE authors SET photo = ? WHERE author_id = ?', [photo, id]);
        }

        res.json({ photo });
    } catch {
        res.status(500).json({ error: 'Internal server error' });
    }
}
