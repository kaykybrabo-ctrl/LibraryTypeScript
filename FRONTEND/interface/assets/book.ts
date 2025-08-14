import { Book, Author } from '../../assets/types';

const parts = window.location.pathname.split('/');
const bookId = parts[2];

const saveBookBtn = document.getElementById('save-book') as HTMLButtonElement | null;
if (!bookId || isNaN(Number(bookId))) {
    alert('Invalid book ID');
    window.location.href = '/interface/main.html';
}

const bookTitle = document.getElementById('book-title') as HTMLElement | null;
const bookAuthor = document.getElementById('book-author') as HTMLElement | null;
const bookCategories = document.getElementById('book-categories') as HTMLElement | null;
const bookPublisher = document.getElementById('book-publisher') as HTMLElement | null;
const bookDescription = document.getElementById('book-description') as HTMLElement | null;
const bookImage = document.getElementById('book-image') as HTMLImageElement | null;
const uploadInput = document.getElementById('upload-image') as HTMLInputElement | null;

async function loadBook() {
    if (!bookId || isNaN(Number(bookId))) {
        if (bookTitle) bookTitle.textContent = 'Book not found';
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`/books/${bookId}`, { headers });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                if (bookTitle) bookTitle.textContent = 'Book not found';
                if (bookAuthor) bookAuthor.textContent = '';
                if (bookCategories) bookCategories.textContent = '';
                if (bookPublisher) bookPublisher.textContent = '';
                if (bookDescription) bookDescription.textContent = '';
            }
            return;
        }

        const book: Book = await res.json();

        if (bookTitle) bookTitle.textContent = book.title || 'No Title';
        if (bookAuthor) bookAuthor.textContent = book.author_name || 'Unknown';
        if (bookCategories) bookCategories.textContent = book.categories || 'None';
        if (bookPublisher) bookPublisher.textContent = book.publisher || 'Unknown';
        if (bookDescription) bookDescription.textContent = book.description || 'No description available.';
        if (bookImage) bookImage.src = book.photo ? `/uploads/${book.photo}?t=${Date.now()}` : '/uploads/default-book.png';
    } catch (error) {
        if (bookTitle) bookTitle.textContent = 'Error loading book';
        if (bookAuthor) bookAuthor.textContent = '';
        if (bookCategories) bookCategories.textContent = '';
        if (bookPublisher) bookPublisher.textContent = '';
        if (bookDescription) bookDescription.textContent = '';
    }
}

saveBookBtn?.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const file = uploadInput?.files?.[0];
    const formData = new FormData();

    if (file) {
        formData.append('book_image', file);
    }

    try {
        const res = await fetch(`/books/${bookId}/update`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data: { photo?: string; error?: string } = await res.json();

        if (res.ok) {
            if (data.photo && bookImage) {
                bookImage.src = `/uploads/${data.photo}?t=${Date.now()}`;
            }

            await fetch(`/users/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookId })
            });

            alert('Book updated!');
        } else {
            alert(data.error || 'Failed to update book');
        }
    } catch (error) {
        alert('Network error');
    }
});

loadBook();
