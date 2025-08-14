var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const parts = window.location.pathname.split('/');
const bookId = parts[2];
const saveBookBtn = document.getElementById('save-book');
if (!bookId || isNaN(Number(bookId))) {
    alert('Invalid book ID');
    window.location.href = '/interface/main.html';
}
const bookTitle = document.getElementById('book-title');
const bookAuthor = document.getElementById('book-author');
const bookCategories = document.getElementById('book-categories');
const bookPublisher = document.getElementById('book-publisher');
const bookDescription = document.getElementById('book-description');
const bookImage = document.getElementById('book-image');
const uploadInput = document.getElementById('upload-image');
function loadBook() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!bookId || isNaN(Number(bookId))) {
            if (bookTitle)
                bookTitle.textContent = 'Book not found';
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = yield fetch(`/books/${bookId}`, { headers });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
                else {
                    if (bookTitle)
                        bookTitle.textContent = 'Book not found';
                    if (bookAuthor)
                        bookAuthor.textContent = '';
                    if (bookCategories)
                        bookCategories.textContent = '';
                    if (bookPublisher)
                        bookPublisher.textContent = '';
                    if (bookDescription)
                        bookDescription.textContent = '';
                }
                return;
            }
            const book = yield res.json();
            if (bookTitle)
                bookTitle.textContent = book.title || 'No Title';
            if (bookAuthor)
                bookAuthor.textContent = book.author_name || 'Unknown';
            if (bookCategories)
                bookCategories.textContent = book.categories || 'None';
            if (bookPublisher)
                bookPublisher.textContent = book.publisher || 'Unknown';
            if (bookDescription)
                bookDescription.textContent = book.description || 'No description available.';
            if (bookImage)
                bookImage.src = book.photo ? `/uploads/${book.photo}?t=${Date.now()}` : '/uploads/default-book.png';
        }
        catch (error) {
            if (bookTitle)
                bookTitle.textContent = 'Error loading book';
            if (bookAuthor)
                bookAuthor.textContent = '';
            if (bookCategories)
                bookCategories.textContent = '';
            if (bookPublisher)
                bookPublisher.textContent = '';
            if (bookDescription)
                bookDescription.textContent = '';
        }
    });
}
saveBookBtn === null || saveBookBtn === void 0 ? void 0 : saveBookBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    const file = (_a = uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.files) === null || _a === void 0 ? void 0 : _a[0];
    const formData = new FormData();
    if (file) {
        formData.append('book_image', file);
    }
    try {
        const res = yield fetch(`/books/${bookId}/update`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = yield res.json();
        if (res.ok) {
            if (data.photo && bookImage) {
                bookImage.src = `/uploads/${data.photo}?t=${Date.now()}`;
            }
            yield fetch(`/users/favorite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ bookId })
            });
            alert('Book updated!');
        }
        else {
            alert(data.error || 'Failed to update book');
        }
    }
    catch (error) {
        alert('Network error');
    }
}));
loadBook();
export {};
