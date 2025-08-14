var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const booksTableBody = document.querySelector("#books-table tbody");
const bookForm = document.querySelector("#book-form");
const paginationDiv = document.getElementById("pagination");
const authorSelect = document.querySelector("#author-select");
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const noResultsMessage = document.getElementById("no-results-message");
let currentPage = 0;
const limit = 5;
let currentSearchQuery = '';
let authorOptions = [];
if (!localStorage.getItem('token')) {
    window.location.href = '/';
}
function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token !== null && token !== void 0 ? token : ''}`
    };
}
function fetchBooks() {
    return __awaiter(this, arguments, void 0, function* (page = 0, searchQuery = '') {
        const offset = page * limit;
        const url = `/books?limit=${limit}&offset=${offset}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}`;
        const totalUrl = `/books/count${searchQuery ? `?search=${encodeURIComponent(searchQuery)}` : ''}`;
        try {
            const [res, totalRes] = yield Promise.all([
                fetch(url, { headers: getAuthHeaders() }),
                fetch(totalUrl, { headers: getAuthHeaders() })
            ]);
            if (!res.ok || !totalRes.ok) {
                if (res.status === 401 || totalRes.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                    return;
                }
                throw new Error('Failed to fetch books data');
            }
            const books = yield res.json();
            const { total } = yield totalRes.json();
            renderBooks(books);
            renderPagination(Math.ceil(total / limit));
            currentPage = page;
        }
        catch (_a) {
            if (booksTableBody) {
                booksTableBody.innerHTML = `<tr><td colspan="5">Failed to load books.</td></tr>`;
            }
            if (noResultsMessage)
                noResultsMessage.style.display = 'none';
        }
    });
}
function renderBooks(books) {
    var _a;
    if (!booksTableBody)
        return;
    if (books.length === 0 && currentSearchQuery) {
        booksTableBody.innerHTML = '';
        if (noResultsMessage)
            noResultsMessage.style.display = 'block';
        return;
    }
    booksTableBody.innerHTML = '';
    for (const book of books) {
        const row = document.createElement('tr');
        row.dataset.bookId = book.book_id.toString();
        row.innerHTML = `
            <td>${book.book_id}</td>
            <td class="author_id">${(_a = book.author_id) !== null && _a !== void 0 ? _a : ''}</td>
            <td class="name">${getAuthorName(book.author_id)}</td>
            <td class="title">${book.title}</td>
            <td>
                <button data-action="view">View</button>
                <button data-action="edit">Edit</button>
                <button data-action="delete">Delete</button>
            </td>
        `;
        const viewBtn = row.querySelector('[data-action="view"]');
        const editBtn = row.querySelector('[data-action="edit"]');
        const deleteBtn = row.querySelector('[data-action="delete"]');
        viewBtn.addEventListener('click', () => {
            window.location.href = `/books/${book.book_id}`;
        });
        editBtn.addEventListener('click', () => startEditBook(book.book_id));
        deleteBtn.addEventListener('click', () => deleteBook(book.book_id));
        booksTableBody.appendChild(row);
    }
    if (noResultsMessage)
        noResultsMessage.style.display = 'none';
}
function getAuthorName(authorId) {
    const author = authorOptions.find(a => a.author_id === authorId);
    return author ? author.name_author : '';
}
function renderPagination(totalPages) {
    if (!paginationDiv)
        return;
    paginationDiv.style.display = totalPages > 1 ? 'block' : 'none';
    paginationDiv.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = (i + 1).toString();
        if (i === currentPage)
            btn.className = 'active';
        btn.addEventListener('click', () => fetchBooks(i, currentSearchQuery));
        paginationDiv.appendChild(btn);
    }
}
function startEditBook(book_id) {
    var _a, _b;
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row)
        return;
    const authorId = ((_a = row.querySelector('.author_id').textContent) === null || _a === void 0 ? void 0 : _a.trim()) || '';
    const title = ((_b = row.querySelector('.title').textContent) === null || _b === void 0 ? void 0 : _b.trim()) || '';
    const nameCell = row.querySelector('.name');
    const select = document.createElement('select');
    for (const author of authorOptions) {
        const option = document.createElement('option');
        option.value = author.author_id.toString();
        option.textContent = author.name_author;
        if (option.value === authorId)
            option.selected = true;
        select.appendChild(option);
    }
    nameCell.innerHTML = '';
    nameCell.appendChild(select);
    const titleCell = row.querySelector('.title');
    titleCell.innerHTML = `<input type="text" value="${title}" />`;
    const actionsCell = row.querySelector('td:last-child');
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
function saveEditBook(book_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
        if (!row)
            return;
        const authorId = row.querySelector('.name select').value.trim();
        const title = row.querySelector('.title input').value.trim();
        if (!authorId || !title || isNaN(Number(authorId)) || Number(authorId) <= 0)
            return;
        try {
            const res = yield fetch(`/books/${book_id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ author_id: Number(authorId), title })
            });
            if (res.ok)
                fetchBooks(currentPage, currentSearchQuery);
            else if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            else {
                alert('Failed to update book.');
            }
        }
        catch (_a) {
            alert('Error updating book.');
        }
    });
}
function cancelEditBook(book_id, oldAuthorId, oldTitle) {
    const row = document.querySelector(`tr[data-book-id="${book_id}"]`);
    if (!row)
        return;
    row.querySelector('.author_id').textContent = oldAuthorId;
    const author = authorOptions.find(a => a.author_id.toString() === oldAuthorId);
    row.querySelector('.name').textContent = author ? author.name_author : '';
    row.querySelector('.title').textContent = oldTitle;
    const actionsCell = row.querySelector('td:last-child');
    actionsCell.innerHTML = '';
    const viewBtn = document.createElement('button');
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', () => {
        window.location.href = `/books/${book_id}`;
    });
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => startEditBook(book_id));
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => deleteBook(book_id));
    actionsCell.appendChild(viewBtn);
    actionsCell.appendChild(editBtn);
    actionsCell.appendChild(deleteBtn);
}
bookForm === null || bookForm === void 0 ? void 0 : bookForm.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const formData = new FormData(bookForm);
    const data = Object.fromEntries(formData.entries());
    const author_id = Number(data.author_id);
    if (!author_id || !data.title.trim() || isNaN(author_id) || author_id <= 0)
        return;
    try {
        const res = yield fetch('/books', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ author_id, title: data.title.trim() })
        });
        if (res.ok) {
            bookForm.reset();
            fetchBooks(currentPage, currentSearchQuery);
        }
        else if (res.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
        else {
            alert('Failed to create book.');
        }
    }
    catch (_a) {
        alert('Error creating book.');
    }
}));
function deleteBook(book_id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Are you sure you want to delete?'))
            return;
        try {
            const res = yield fetch(`/books/${book_id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok)
                fetchBooks(currentPage, currentSearchQuery);
            else if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            }
            else {
                alert('Failed to delete book.');
            }
        }
        catch (_a) {
            alert('Error deleting book.');
        }
    });
}
function populateAuthorSelect() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!authorSelect)
            return;
        try {
            const res = yield fetch('/authors?limit=9999&offset=0', {
                headers: getAuthHeaders()
            });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
                return;
            }
            const authors = yield res.json();
            authorOptions = authors;
            authorSelect.innerHTML = '<option value="">Select an Author</option>';
            for (const author of authors) {
                const option = document.createElement('option');
                option.value = author.author_id.toString();
                option.textContent = author.name_author;
                authorSelect.appendChild(option);
            }
        }
        catch (_a) {
            if (authorSelect) {
                authorSelect.innerHTML = '<option value="">Error loading authors</option>';
                authorSelect.disabled = true;
            }
        }
    });
}
searchForm === null || searchForm === void 0 ? void 0 : searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    currentSearchQuery = (searchInput === null || searchInput === void 0 ? void 0 : searchInput.value.trim()) || '';
    fetchBooks(0, currentSearchQuery);
});
const pagePath = window.location.pathname.split('/').pop();
document.querySelectorAll('nav a').forEach(link => {
    var _a;
    const href = (_a = link.getAttribute('href')) === null || _a === void 0 ? void 0 : _a.split('/').pop();
    if (href === pagePath) {
        link.classList.add('active');
    }
    else {
        link.classList.remove('active');
    }
});
fetchBooks();
populateAuthorSelect();
const logoutButton = document.getElementById('logout-button');
logoutButton === null || logoutButton === void 0 ? void 0 : logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});
export {};
