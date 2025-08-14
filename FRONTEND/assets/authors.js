var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const tableBody = document.querySelector("#authors tbody");
const form = document.querySelector("#author-form");
const paginationDiv = document.getElementById("pagination");
let currentPage = 0;
const limit = 5;
const token = localStorage.getItem('token');
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}
function fetchAuthors() {
    return __awaiter(this, arguments, void 0, function* (page = 0) {
        const offset = page * limit;
        try {
            const res = yield fetch(`/authors?limit=${limit}&offset=${offset}`, { headers: getAuthHeaders() });
            const totalRes = yield fetch(`/authors/count`, { headers: getAuthHeaders() });
            if (!res.ok || !totalRes.ok)
                return;
            const authors = yield res.json();
            const { total } = yield totalRes.json();
            if (tableBody) {
                tableBody.innerHTML = authors.map(author => `
                <tr data-author-id="${author.author_id}">
                    <td>${author.author_id}</td>
                    <td class="name">${author.name_author}</td>
                    <td>
                        <button class="view-btn" data-id="${author.author_id}">View</button>
                        <button class="edit-btn" data-id="${author.author_id}">Edit</button>
                        <button class="delete-btn" data-id="${author.author_id}">Delete</button>
                    </td>
                </tr>
            `).join('');
            }
            currentPage = page;
            renderPagination(Math.ceil(total / limit));
        }
        catch (_a) {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="3">Failed to load authors.</td></tr>`;
            }
        }
    });
}
function renderPagination(totalPages) {
    if (!paginationDiv)
        return;
    paginationDiv.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = (i + 1).toString();
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => fetchAuthors(i));
        paginationDiv.appendChild(btn);
    }
}
function startEdit(author_id) {
    const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
    if (!row)
        return;
    const nameCell = row.querySelector('.name');
    const actionsCell = row.querySelector('td:last-child');
    const currentName = nameCell.textContent || '';
    nameCell.innerHTML = `<input type="text" value="${currentName}" />`;
    actionsCell.innerHTML = `
        <button class="save-btn" data-id="${author_id}">Save</button>
        <button class="cancel-btn" data-id="${author_id}" data-old-name="${currentName.replace(/"/g, '&quot;')}">Cancel</button>
    `;
}
function saveEdit(author_id) {
    return __awaiter(this, void 0, void 0, function* () {
        const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
        if (!row)
            return;
        const nameInput = row.querySelector('.name input');
        const updatedName = nameInput.value.trim();
        if (!updatedName)
            return;
        try {
            const res = yield fetch(`/authors/${author_id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ name_author: updatedName }),
            });
            if (res.ok)
                fetchAuthors(currentPage);
        }
        catch (_a) { }
    });
}
function cancelEdit(author_id, oldName) {
    const row = document.querySelector(`tr[data-author-id="${author_id}"]`);
    if (!row)
        return;
    row.querySelector('.name').textContent = oldName;
    row.querySelector('td:last-child').innerHTML =
        `<button class="view-btn" data-id="${author_id}">View</button>
         <button class="edit-btn" data-id="${author_id}">Edit</button>
         <button class="delete-btn" data-id="${author_id}">Delete</button>`;
}
function deleteAuthor(author_id) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!confirm('Are you sure you want to delete?'))
            return;
        try {
            const res = yield fetch(`/authors/${author_id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            if (res.ok)
                fetchAuthors(currentPage);
        }
        catch (_a) { }
    });
}
tableBody === null || tableBody === void 0 ? void 0 : tableBody.addEventListener('click', (e) => {
    const target = e.target;
    if (target.classList.contains('view-btn')) {
        const id = Number(target.dataset.id);
        window.location.href = `/authors/${id}`;
    }
    else if (target.classList.contains('edit-btn')) {
        const id = Number(target.dataset.id);
        startEdit(id);
    }
    else if (target.classList.contains('save-btn')) {
        const id = Number(target.dataset.id);
        saveEdit(id);
    }
    else if (target.classList.contains('cancel-btn')) {
        const id = Number(target.dataset.id);
        const oldName = target.dataset.oldName || '';
        cancelEdit(id, oldName);
    }
    else if (target.classList.contains('delete-btn')) {
        const id = Number(target.dataset.id);
        deleteAuthor(id);
    }
});
form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    if (!data.name || data.name.trim() === '')
        return;
    try {
        const res = yield fetch(`/authors`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ name_author: data.name.trim() }),
        });
        if (res.ok) {
            form.reset();
            fetchAuthors(currentPage);
        }
    }
    catch (_a) { }
}));
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
fetchAuthors();
const logoutButton = document.getElementById('logout-button');
logoutButton === null || logoutButton === void 0 ? void 0 : logoutButton.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = '/';
});
export { };
