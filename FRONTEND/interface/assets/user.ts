import { Book, Author } from '../../assets/types';

const saveDescriptionBtn = document.getElementById('save-description') as HTMLButtonElement;
const descriptionInput = document.getElementById('user-description') as HTMLInputElement;
const uploadInput = document.getElementById('upload-image') as HTMLInputElement;
const userImage = document.getElementById('user-image') as HTMLImageElement;
const usernameDisplay = document.getElementById('username-display') as HTMLElement;
const logoutButton = document.getElementById('logout-button') as HTMLButtonElement;
const booksContainer = document.getElementById('books-container') as HTMLElement;
const paginationDiv = document.getElementById('pagination') as HTMLElement;
const favoritesContainer = document.getElementById('favorites-container') as HTMLElement;
const historyContainer = document.getElementById('history-container') as HTMLElement;
const reviewsContainer = document.getElementById('reviews-container') as HTMLElement;
const bookSelect = document.getElementById('book-select') as HTMLSelectElement;
const reviewForm = document.getElementById('review-form') as HTMLFormElement;

const username = localStorage.getItem('username') || '';
const token = localStorage.getItem('token') || '';

if (!username) location.href = '/interface/main.html';
else if (usernameDisplay) usernameDisplay.textContent = username;

let currentPage = 0;
const limit = 5;

const getAuthHeaders = (type = 'application/json') => {
    const h: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (type) h['Content-Type'] = type;
    return h;
};

async function fetchBooks(page = 0): Promise<void> {
    const offset = page * limit;
    try {
        const [resBooks, resCount] = await Promise.all([
            fetch(`/books?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() }),
            fetch('/books/count', { headers: getAuthHeaders() })
        ]);
        if (!resBooks.ok || !resCount.ok) throw new Error();
        const books: Book[] = await resBooks.json();
        const { total }: { total: number } = await resCount.json();
        renderBooks(books);
        renderPagination(Math.ceil(total / limit));
        currentPage = page;
    } catch {
        booksContainer.innerHTML = '<p>Failed to load books.</p>';
        paginationDiv.style.display = 'none';
    }
}

function renderBooks(books: Book[]): void {
    booksContainer.innerHTML = books.length
        ? books.map(book => `
            <div class="book-card">
                <img src="${book.photo ? `uploads/${book.photo}` : 'uploads/default-book.png'}" alt="${book.title}" width="80" height="80" />
                <h3>${book.title}</h3>
                <button class="rent-btn" data-id="${book.book_id}">Rent</button>
                <button class="favorite-btn" data-id="${book.book_id}">Favorite</button>
            </div>
        `).join('')
        : '<p>No books found.</p>';
    setupBookButtons();
}

function setupBookButtons(): void {
    document.querySelectorAll<HTMLButtonElement>('.rent-btn').forEach(btn =>
        btn.onclick = async () => {
            const id = btn.dataset.id;
            if (!id) return;
            const res = await fetch(`/rent/${id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ username })
            });
            if (res.ok) { alert('Book rented!'); fetchLoanHistory(); }
            else alert((await res.json()).error || 'Failed to rent');
        }
    );

    document.querySelectorAll<HTMLButtonElement>('.favorite-btn').forEach(btn =>
        btn.onclick = async () => {
            const id = btn.dataset.id;
            if (!id) return;
            const res = await fetch(`/favorite/${id}`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ username })
            });
            if (res.ok) { alert('Book favorited!'); fetchFavoriteBook(); }
            else alert((await res.json()).error || 'Failed to favorite');
        }
    );
}

function renderFavoriteBook(book: Book | null): void {
    favoritesContainer.innerHTML = book?.book_id
        ? `<div class="favorite-book-card">
            <img src="${book.photo ? `uploads/${book.photo}` : 'uploads/default-book.png'}" alt="${book.title}" width="80" height="80" />
            <h3>${book.title}</h3><p>${book.description || ''}</p>
          </div>`
        : '<p>No favorite book found.</p>';
}

async function fetchFavoriteBook(): Promise<void> {
    try {
        const res = await fetch(`/users/favorite?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
        renderFavoriteBook(res.ok ? await res.json() : null);
    } catch { favoritesContainer.innerHTML = '<p>Error loading favorite book.</p>'; }
}

async function fetchLoanHistory(): Promise<void> {
    try {
        const res = await fetch(`/loans?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
        renderLoanHistory(res.ok ? await res.json() : []);
    } catch { historyContainer.innerHTML = '<p>Error loading rental history.</p>'; }
}

function renderLoanHistory(loans: any[]): void {
    historyContainer.innerHTML = loans.length
        ? loans.map(loan => `
            <div class="loan-item">
                <strong>${loan.title}</strong> - Loan Date: ${new Date(loan.loan_date).toLocaleDateString()}
                <button class="return-btn" data-loan-id="${loan.loans_id}">Return</button>
            </div>
        `).join('')
        : '<p>No rental history found.</p>';
    setupReturnButtons();
}

function setupReturnButtons(): void {
    document.querySelectorAll<HTMLButtonElement>('.return-btn').forEach(btn =>
        btn.onclick = async () => {
            const res = await fetch(`/return/${btn.dataset.loanId}`, { method: 'POST', headers: getAuthHeaders() });
            if (res.ok) { alert('Book returned!'); fetchLoanHistory(); fetchBooks(currentPage); }
            else alert((await res.json()).error || 'Failed to return');
        }
    );
}

async function populateBookSelect(): Promise<void> {
    try {
        const res = await fetch('/books?limit=100&offset=0', { headers: getAuthHeaders() });
        const books: Book[] = res.ok ? await res.json() : [];
        bookSelect.innerHTML = '<option value="">Select a book</option>' +
            books.map(b => `<option value="${b.book_id}">${b.title}</option>`).join('');
    } catch { bookSelect.innerHTML = '<option value="">Error loading books</option>'; }
}

async function fetchReviews(): Promise<void> {
    try {
        const res = await fetch('/reviews', { headers: getAuthHeaders() });
        renderReviews(res.ok ? await res.json() : []);
    } catch { reviewsContainer.innerHTML = '<p>Error loading reviews.</p>'; }
}

function renderReviews(reviews: any[]): void {
    reviewsContainer.innerHTML = reviews.length
        ? reviews.map(r => `
            <div class="review-card">
                <div class="review-header">
                    <strong>${r.username}</strong> rated <em>${r.bookTitle}</em>
                    <div class="review-rating">${'★'.repeat(r.rating) + '☆'.repeat(5 - r.rating)}</div>
                </div>
                <div class="review-comment">${r.comment || 'No comment provided'}</div>
                <div class="review-date">${new Date(r.review_date).toLocaleDateString()}</div>
                <hr/>
            </div>
        `).join('')
        : '<p>No reviews yet.</p>';
}

reviewForm.onsubmit = async (e: Event) => {
    e.preventDefault();
    const book_id = bookSelect.value;
    const rating = parseInt((document.getElementById('rating') as HTMLInputElement).value);
    const comment = (document.getElementById('comment') as HTMLInputElement).value.trim();
    if (!book_id || rating < 1 || rating > 5) return alert('Invalid input');

    const userRes = await fetch('/get-user-id-from-session', { headers: getAuthHeaders() });
    if (!userRes.ok) return alert('Please login');

    const { user_id } = await userRes.json();
    const reviewRes = await fetch('/reviews', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ book_id, user_id, rating, comment })
    });
    if (reviewRes.ok) { alert('Review submitted!'); reviewForm.reset(); fetchReviews(); }
    else alert((await reviewRes.json()).error || 'Failed to submit review');
};

window.addEventListener('DOMContentLoaded', async () => {
    try {
        const res = await fetch(`/get-profile?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
        if (res.ok) {
            const data = await res.json();
            userImage.src = data.profile_image ? `uploads/${data.profile_image}` : 'uploads/default-user.png';
            descriptionInput.value = data.description || '';
        }
    } catch { }
    fetchBooks();
    fetchFavoriteBook();
    fetchLoanHistory();
    populateBookSelect();
    fetchReviews();
});

if (saveDescriptionBtn) {
    saveDescriptionBtn.onclick = async () => {
        const formData = new FormData();
        formData.append('username', username);
        formData.append('description', descriptionInput.value.trim());
        if (uploadInput.files?.[0]) formData.append('profile_image', uploadInput.files[0]);
        const res = await fetch('/update-profile', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        const data = await res.json();
        if (res.ok) { if (data.profile_image) userImage.src = `uploads/${data.profile_image}`; alert('Profile updated!'); }
        else alert(data.error || 'Failed to update profile');
    };
}

if (logoutButton) logoutButton.onclick = () => {
    localStorage.clear();
    location.href = '/';
};

function renderPagination(totalPages: number): void {
    paginationDiv.innerHTML = totalPages <= 1 ? '' :
        Array.from({ length: totalPages }, (_, i) => `<button class="${i === currentPage ? 'active' : ''}">${i + 1}</button>`).join('');
    paginationDiv.querySelectorAll<HTMLButtonElement>('button').forEach((btn, i) => btn.onclick = () => fetchBooks(i));
}
