var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const saveDescriptionBtn = document.getElementById('save-description');
const descriptionInput = document.getElementById('user-description');
const uploadInput = document.getElementById('upload-image');
const userImage = document.getElementById('user-image');
const usernameDisplay = document.getElementById('username-display');
const logoutButton = document.getElementById('logout-button');
const booksContainer = document.getElementById('books-container');
const paginationDiv = document.getElementById('pagination');
const favoritesContainer = document.getElementById('favorites-container');
const historyContainer = document.getElementById('history-container');
const reviewsContainer = document.getElementById('reviews-container');
const bookSelect = document.getElementById('book-select');
const reviewForm = document.getElementById('review-form');
const username = localStorage.getItem('username') || '';
const token = localStorage.getItem('token') || '';
if (!username)
    location.href = '/interface/main.html';
else if (usernameDisplay)
    usernameDisplay.textContent = username;
let currentPage = 0;
const limit = 5;
const getAuthHeaders = (type = 'application/json') => {
    const h = { Authorization: `Bearer ${token}` };
    if (type)
        h['Content-Type'] = type;
    return h;
};
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (page = 0) {
        const offset = page * limit;
        try {
            const [resBooks, resCount] = yield Promise.all([
                fetch(`/books?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() }),
                fetch('/books/count', { headers: getAuthHeaders() })
            ]);
            if (!resBooks.ok || !resCount.ok)
                throw new Error();
            const books = yield resBooks.json();
            const { total } = yield resCount.json();
            renderBooks(books);
            renderPagination(Math.ceil(total / limit));
            currentPage = page;
        }
        catch (_a) {
            booksContainer.innerHTML = '<p>Failed to load books.</p>';
            paginationDiv.style.display = 'none';
        }
    });
}
function renderBooks(books) {
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
function setupBookButtons() {
    document.querySelectorAll('.rent-btn').forEach(btn => btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const id = btn.dataset.id;
        if (!id)
            return;
        const res = yield fetch(`/rent/${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username })
        });
        if (res.ok) {
            alert('Book rented!');
            fetchLoanHistory();
        }
        else
            alert((yield res.json()).error || 'Failed to rent');
    }));
    document.querySelectorAll('.favorite-btn').forEach(btn => btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const id = btn.dataset.id;
        if (!id)
            return;
        const res = yield fetch(`/favorite/${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ username })
        });
        if (res.ok) {
            alert('Book favorited!');
            fetchFavoriteBook();
        }
        else
            alert((yield res.json()).error || 'Failed to favorite');
    }));
}
function renderFavoriteBook(book) {
    favoritesContainer.innerHTML = (book === null || book === void 0 ? void 0 : book.book_id)
        ? `<div class="favorite-book-card">
            <img src="${book.photo ? `uploads/${book.photo}` : 'uploads/default-book.png'}" alt="${book.title}" width="80" height="80" />
            <h3>${book.title}</h3><p>${book.description || ''}</p>
          </div>`
        : '<p>No favorite book found.</p>';
}
function fetchFavoriteBook() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`/users/favorite?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
            renderFavoriteBook(res.ok ? yield res.json() : null);
        }
        catch (_a) {
            favoritesContainer.innerHTML = '<p>Error loading favorite book.</p>';
        }
    });
}
function fetchLoanHistory() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch(`/loans?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
            renderLoanHistory(res.ok ? yield res.json() : []);
        }
        catch (_a) {
            historyContainer.innerHTML = '<p>Error loading rental history.</p>';
        }
    });
}
function renderLoanHistory(loans) {
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
function setupReturnButtons() {
    document.querySelectorAll('.return-btn').forEach(btn => btn.onclick = () => __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`/return/${btn.dataset.loanId}`, { method: 'POST', headers: getAuthHeaders() });
        if (res.ok) {
            alert('Book returned!');
            fetchLoanHistory();
            fetchBooks(currentPage);
        }
        else
            alert((yield res.json()).error || 'Failed to return');
    }));
}
function populateBookSelect() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/books?limit=100&offset=0', { headers: getAuthHeaders() });
            const books = res.ok ? yield res.json() : [];
            bookSelect.innerHTML = '<option value="">Select a book</option>' +
                books.map(b => `<option value="${b.book_id}">${b.title}</option>`).join('');
        }
        catch (_a) {
            bookSelect.innerHTML = '<option value="">Error loading books</option>';
        }
    });
}
function fetchReviews() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/reviews', { headers: getAuthHeaders() });
            renderReviews(res.ok ? yield res.json() : []);
        }
        catch (_a) {
            reviewsContainer.innerHTML = '<p>Error loading reviews.</p>';
        }
    });
}
function renderReviews(reviews) {
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
reviewForm.onsubmit = (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const book_id = bookSelect.value;
    const rating = parseInt(document.getElementById('rating').value);
    const comment = document.getElementById('comment').value.trim();
    if (!book_id || rating < 1 || rating > 5)
        return alert('Invalid input');
    const userRes = yield fetch('/get-user-id-from-session', { headers: getAuthHeaders() });
    if (!userRes.ok)
        return alert('Please login');
    const { user_id } = yield userRes.json();
    const reviewRes = yield fetch('/reviews', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ book_id, user_id, rating, comment })
    });
    if (reviewRes.ok) {
        alert('Review submitted!');
        reviewForm.reset();
        fetchReviews();
    }
    else
        alert((yield reviewRes.json()).error || 'Failed to submit review');
});
window.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield fetch(`/get-profile?username=${encodeURIComponent(username)}`, { headers: getAuthHeaders() });
        if (res.ok) {
            const data = yield res.json();
            userImage.src = data.profile_image ? `uploads/${data.profile_image}` : 'uploads/default-user.png';
            descriptionInput.value = data.description || '';
        }
    }
    catch (_a) { }
    fetchBooks();
    fetchFavoriteBook();
    fetchLoanHistory();
    populateBookSelect();
    fetchReviews();
}));
if (saveDescriptionBtn) {
    saveDescriptionBtn.onclick = () => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const formData = new FormData();
        formData.append('username', username);
        formData.append('description', descriptionInput.value.trim());
        if ((_a = uploadInput.files) === null || _a === void 0 ? void 0 : _a[0])
            formData.append('profile_image', uploadInput.files[0]);
        const res = yield fetch('/update-profile', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
        const data = yield res.json();
        if (res.ok) {
            if (data.profile_image)
                userImage.src = `uploads/${data.profile_image}`;
            alert('Profile updated!');
        }
        else
            alert(data.error || 'Failed to update profile');
    });
}
if (logoutButton)
    logoutButton.onclick = () => {
        localStorage.clear();
        location.href = '/';
    };
function renderPagination(totalPages) {
    paginationDiv.innerHTML = totalPages <= 1 ? '' :
        Array.from({ length: totalPages }, (_, i) => `<button class="${i === currentPage ? 'active' : ''}">${i + 1}</button>`).join('');
    paginationDiv.querySelectorAll('button').forEach((btn, i) => btn.onclick = () => fetchBooks(i));
}
export {};
