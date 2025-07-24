import type { Book, Author } from './types';

const booksTableBody = document.querySelector<HTMLTableSectionElement>("#books-table tbody");
const bookForm = document.querySelector<HTMLFormElement>("#book-form");
const paginationDiv = document.getElementById("pagination") as HTMLDivElement | null;
const authorSelect = document.querySelector<HTMLSelectElement>("#author-select");
const searchForm = document.getElementById("search-form") as HTMLFormElement | null;
const searchInput = document.getElementById("search-input") as HTMLInputElement | null;
const noResultsMessage = document.getElementById("no-results-message") as HTMLDivElement | null;

let currentPage = 0;
const limit = 5;
let currentSearchQuery = '';
let authorOptions: Author[] = [];

async function fetchBooks(page = 0, searchQuery = '') {
    const offset = page * limit;
    const url = `/books?limit=${limit}&offset=${offset}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
    const totalUrl = `/books/count${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;

    try {
        const [res, totalRes] = await Promise.all([fetch(url), fetch(totalUrl)]);
        if (!res.ok || !totalRes.ok) return;

        const books: Book[] = await res.json();
        const { total } = await totalRes.json();

        renderBooks(books);
        renderPagination(Math.ceil(total / limit));
        currentPage = page;
    } catch {
        if (booksTableBody) {
            booksTableBody.innerHTML = `<tr><td colspan="5">Failed to load books.</td></tr>`;
        }
        if (noResultsMessage) noResultsMessage.style.display = 'none';
    }
}

function renderBooks(books: Book[]) {
    if (!booksTableBody) return;

    if (books.length === 0 && currentSearchQuery) {
        booksTableBody.innerHTML = '';
        if (noResultsMessage) noResultsMessage.style.display = 'block';
        return;
    }

    booksTableBody.innerHTML = '';
    for (const book of books) {
        const row = document.createElement('tr');
        row.dataset.bookId = book.book_id.toString();

        row.innerHTML = `
            <td>${book.book_id}</td>
            <td class="author_id">${book.author_id ?? ''}</td>
            <td class="name">${getAuthorName(book.author_id)}</td>
            <td class="title">${book.title}</td>
            <td>
                <button data-action="edit">Edit</button>
                <button data-action="delete">Delete</button>
            </td>
        `;

        const editBtn = row.querySelector('[data-action="edit"]') as HTMLButtonElement;
        const deleteBtn = row.querySelector('[data-action="delete"]') as HTMLButtonElement;

        editBtn.addEventListener('click', () => startEditBook(book.book_id));
        deleteBtn.addEventListener('click', () => deleteBook(book.book_id));

        booksTableBody.appendChild(row);
    }

    if (noResultsMessage) noResultsMessage.style.display = 'none';
}

function getAuthorName(authorId: number): string {
    const author = authorOptions.find(a => a.author_id === authorId);
    return author ? author.name_author : '';
}

function renderPagination(totalPages: number) {
    if (!paginationDiv) return;

    paginationDiv.style.display = totalPages > 1 ? 'block' : 'none';
    paginationDiv.innerHTML = '';

    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = (i + 1).toString();
        if (i === currentPage) btn.className = 'active';
        btn.addEventListener('click', () => fetchBooks(i, currentSearchQuery));
        paginationDiv.appendChild(btn);
    }
}

function startEditBook(book_id: number) {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    const authorId = (row.querySelector('.author_id') as HTMLElement).textContent?.trim() || '';
    const title = (row.querySelector('.title') as HTMLElement).textContent?.trim() || '';
    const nameCell = row.querySelector('.name') as HTMLElement;

    const select = document.createElement('select');
    for (const author of authorOptions) {
        const option = document.createElement('option');
        option.value = author.author_id.toString();
        option.textContent = author.name_author;
        if (option.value === authorId) option.selected = true;
        select.appendChild(option);
    }

    nameCell.innerHTML = '';
    nameCell.appendChild(select);

    const titleCell = row.querySelector('.title') as HTMLElement;
    titleCell.innerHTML = `<input type="text" value="${title}" />`;

    const actionsCell = row.querySelector('td:last-child') as HTMLElement;
    actionsCell.innerHTML = '';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.addEventListener('click', () => saveEditBook(book_id));

    const cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => cancelEditBook(book_id, authorId, title));

    actionsCell.appendChild(saveBtn);
    actionsCell.appendChild(cancelBtn);
}

async function saveEditBook(book_id: number) {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    const authorId = (row.querySelector('.name select') as HTMLSelectElement).value.trim();
    const title = (row.querySelector('.title input') as HTMLInputElement).value.trim();

    if (!authorId || !title || isNaN(Number(authorId)) || Number(authorId) <= 0) return;

    try {
        const res = await fetch(`/books/${book_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author_id: Number(authorId), title })
        });

        if (res.ok) fetchBooks(currentPage, currentSearchQuery);
    } catch { }
}

function cancelEditBook(book_id: number, oldAuthorId: string, oldTitle: string) {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-book-id="${book_id}"]`);
    if (!row) return;

    (row.querySelector('.author_id') as HTMLElement).textContent = oldAuthorId;
    const author = authorOptions.find(a => a.author_id.toString() === oldAuthorId);
    (row.querySelector('.name') as HTMLElement).textContent = author ? author.name_author : '';
    (row.querySelector('.title') as HTMLElement).textContent = oldTitle;

    const actionsCell = row.querySelector('td:last-child') as HTMLElement;
    actionsCell.innerHTML = '';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditBook(book_id));

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteBook(book_id));

    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
}

bookForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(bookForm);
    const data = Object.fromEntries(formData.entries()) as { title: string; author_id: string };
    const author_id = Number(data.author_id);

    if (!author_id || !data.title.trim() || isNaN(author_id) || author_id <= 0) return;

    try {
        const res = await fetch('/books', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ author_id, title: data.title.trim() })
        });

        if (res.ok) {
            bookForm.reset();
            fetchBooks(currentPage, currentSearchQuery);
        }
    } catch { }
});

async function deleteBook(book_id: number) {
    if (!confirm('Are you sure you want to delete?')) return;

    try {
        const res = await fetch(`/books/${book_id}`, { method: 'DELETE' });
        if (res.ok) fetchBooks(currentPage, currentSearchQuery);
    } catch { }
}

async function populateAuthorSelect() {
    if (!authorSelect) return;

    try {
        const res = await fetch('/authors?limit=9999&offset=0');
        if (!res.ok) return;

        const authors: Author[] = await res.json();
        authorOptions = authors;

        authorSelect.innerHTML = '<option value="">Select an Author</option>';
        for (const author of authors) {
            const option = document.createElement('option');
            option.value = author.author_id.toString();
            option.textContent = author.name_author;
            authorSelect.appendChild(option);
        }
    } catch {
        authorSelect.innerHTML = '<option value="">Error loading authors</option>';
        authorSelect.disabled = true;
    }
}

searchForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchQuery = searchInput?.value.trim() || '';
    fetchBooks(0, currentSearchQuery);
});

fetchBooks();
populateAuthorSelect();