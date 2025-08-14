import { Request, Response } from 'express';
import { executeQuery } from '../DB/connection';

export async function getProfile(req: Request, res: Response) {
    const username = req.query.username as string;
    if (!username) return res.status(400).json({ error: 'Username is required' });

    try {
        const results: any[] = await executeQuery(
            'SELECT photo AS profile_image, description FROM users WHERE username = ? LIMIT 1',
            [username]
        );

        if (!results.length) return res.status(404).json({ error: 'User not found' });

        const user = results[0];

        res.json({
            profile_image: user.profile_image || 'default-user.png',
            description: user.description || ''
        });
    } catch {
        res.status(500).json({ error: 'Database error' });
    }
}
