import type { Author } from './types';

const tableBody = document.querySelector<HTMLTableSectionElement>("#authors tbody");
const form = document.querySelector<HTMLFormElement>("#author-form");
const paginationDiv = document.getElementById("pagination") as HTMLDivElement | null;

let currentPage = 0;
const limit = 5;

async function fetchAuthors(page = 0): Promise<void> {
    const offset = page * limit;

    try {
        const res = await fetch(`/authors?limit=${limit}&offset=${offset}`);
        const totalRes = await fetch(`/authors/count`);
        if (!res.ok || !totalRes.ok) return;

        const authors: Author[] = await res.json();
        const { total } = await totalRes.json();

        if (tableBody) {
            tableBody.innerHTML = authors.map(author => `
                <tr data-author-id="${author.author_id}">
                    <td>${author.author_id}</td>
                    <td class="name">${author.name_author}</td>
                    <td>
                        <button class="edit-btn" data-id="${author.author_id}">Edit</button>
                        <button class="delete-btn" data-id="${author.author_id}">Delete</button>
                    </td>
                </tr>
            `).join('');
        }

        currentPage = page;
        renderPagination(Math.ceil(total / limit));
    } catch {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="3">Failed to load authors.</td></tr>`;
        }
    }
}

function renderPagination(totalPages: number): void {
    if (!paginationDiv) return;

    paginationDiv.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = (i + 1).toString();
        btn.className = i === currentPage ? 'active' : '';
        btn.addEventListener('click', () => fetchAuthors(i));
        paginationDiv.appendChild(btn);
    }
}

function startEdit(author_id: number): void {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-author-id="${author_id}"]`);
    if (!row) return;

    const nameCell = row.querySelector('.name') as HTMLElement;
    const actionsCell = row.querySelector('td:last-child') as HTMLElement;
    const currentName = nameCell.textContent || '';

    nameCell.innerHTML = `<input type="text" value="${currentName}" />`;
    actionsCell.innerHTML = `
        <button class="save-btn" data-id="${author_id}">Save</button>
        <button class="cancel-btn" data-id="${author_id}" data-old-name="${currentName.replace(/"/g, '&quot;')}">Cancel</button>
    `;
}

async function saveEdit(author_id: number): Promise<void> {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-author-id="${author_id}"]`);
    if (!row) return;

    const nameInput = row.querySelector('.name input') as HTMLInputElement;
    const updatedName = nameInput.value.trim();
    if (!updatedName) return;

    try {
        const res = await fetch(`/authors/${author_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name_author: updatedName }),
        });
        if (res.ok) fetchAuthors(currentPage);
    } catch { }
}

function cancelEdit(author_id: number, oldName: string): void {
    const row = document.querySelector<HTMLTableRowElement>(`tr[data-author-id="${author_id}"]`);
    if (!row) return;

    (row.querySelector('.name') as HTMLElement).textContent = oldName;
    (row.querySelector('td:last-child') as HTMLElement).innerHTML =
        `<button class="edit-btn" data-id="${author_id}">Edit</button>
         <button class="delete-btn" data-id="${author_id}">Delete</button>`;
}

async function deleteAuthor(author_id: number): Promise<void> {
    if (!confirm('Are you sure you want to delete?')) return;

    try {
        const res = await fetch(`/authors/${author_id}`, { method: 'DELETE' });
        if (res.ok) fetchAuthors(currentPage);
    } catch { }
}

tableBody?.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    if (target.classList.contains('edit-btn')) {
        const id = Number(target.dataset.id);
        startEdit(id);
    } else if (target.classList.contains('save-btn')) {
        const id = Number(target.dataset.id);
        saveEdit(id);
    } else if (target.classList.contains('cancel-btn')) {
        const id = Number(target.dataset.id);
        const oldName = target.dataset.oldName || '';
        cancelEdit(id, oldName);
    } else if (target.classList.contains('delete-btn')) {
        const id = Number(target.dataset.id);
        deleteAuthor(id);
    }
});

form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()) as { name: string };

    if (!data.name || data.name.trim() === '') return;

    try {
        const res = await fetch(`/authors`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name_author: data.name.trim() }),
        });
        if (res.ok) {
            form.reset();
            fetchAuthors(currentPage);
        }
    } catch { }
});

fetchAuthors();
