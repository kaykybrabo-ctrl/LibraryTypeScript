import express from 'express';
import path from 'path';

import { read as readBooks } from './books/read';
import { create as createBook } from './books/create';
import { update as updateBook } from './books/update';
import { deleteb as deleteBook } from './books/deleteb';
import { count as countBooks } from './books/count';

import { read as readAuthors } from './authors/read';
import { create as createAuthor } from './authors/create';
import { update as updateAuthor } from './authors/update';
import { deletea as deleteAuthor } from './authors/deletea';
import { count as countAuthors } from './authors/count';

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../FRONTEND')));

app.get('/books', readBooks);
app.get('/books/count', countBooks);
app.post('/books', createBook);
app.put('/books/:id', updateBook);
app.delete('/books/:id', deleteBook);

app.get('/authors', readAuthors);
app.get('/authors/count', countAuthors);
app.post('/authors', createAuthor);
app.put('/authors/:id', updateAuthor);
app.delete('/authors/:id', deleteAuthor);

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/index.html'));
});

app.get('/authors.html', (_req, res) => {
    res.sendFile(path.join(__dirname, '../FRONTEND/authors.html'));
});

const PORT = 8080;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
