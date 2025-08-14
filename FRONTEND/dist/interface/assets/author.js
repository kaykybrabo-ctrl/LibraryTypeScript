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
const authorId = parts[2];
const saveAuthorBtn = document.getElementById('save-author');
if (!authorId || isNaN(Number(authorId))) {
    alert('Invalid author ID');
    window.location.href = '/interface/main.html';
}
const nameAuthor = document.getElementById('author-name');
const biography = document.getElementById('author-biography');
const authorImage = document.getElementById('author-image');
const uploadInput = document.getElementById('upload-image');
function loadAuthor() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!authorId || isNaN(Number(authorId))) {
            if (nameAuthor)
                nameAuthor.textContent = 'Author not found';
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
            const res = yield fetch(`/authors/${authorId}`, { headers });
            if (!res.ok) {
                if (res.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/';
                }
                else {
                    if (nameAuthor)
                        nameAuthor.textContent = 'Author not found';
                    if (biography)
                        biography.textContent = '';
                }
                return;
            }
            const author = yield res.json();
            if (nameAuthor)
                nameAuthor.textContent = author.name_author || 'Unknown';
            if (biography)
                biography.textContent = author.biography || 'No biography available.';
            if (authorImage)
                authorImage.src = author.photo ? `/uploads/${author.photo}?t=${Date.now()}` : '/uploads/default-user.png';
        }
        catch (error) {
            if (nameAuthor)
                nameAuthor.textContent = 'Error loading author';
            if (biography)
                biography.textContent = '';
        }
    });
}
saveAuthorBtn === null || saveAuthorBtn === void 0 ? void 0 : saveAuthorBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }
    const file = (_a = uploadInput === null || uploadInput === void 0 ? void 0 : uploadInput.files) === null || _a === void 0 ? void 0 : _a[0];
    const formData = new FormData();
    if (file) {
        formData.append('author_image', file);
    }
    try {
        const res = yield fetch(`/authors/${authorId}/update`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = yield res.json();
        if (res.ok) {
            if (data.photo && authorImage) {
                authorImage.src = `/uploads/${data.photo}?t=${Date.now()}`;
            }
            alert('Author updated!');
        }
        else {
            alert(data.error || 'Failed to update author');
        }
    }
    catch (error) {
        alert('Network error');
    }
}));
loadAuthor();
export {};
