import type { Author } from '../../assets/types';

const parts = window.location.pathname.split('/');
const authorId = parts[2];

const saveAuthorBtn = document.getElementById('save-author') as HTMLButtonElement | null;
if (!authorId || isNaN(Number(authorId))) {
    alert('Invalid author ID');
    window.location.href = '/interface/main.html';
}

const nameAuthor = document.getElementById('author-name') as HTMLElement | null;
const biography = document.getElementById('author-biography') as HTMLElement | null;
const authorImage = document.getElementById('author-image') as HTMLImageElement | null;
const uploadInput = document.getElementById('upload-image') as HTMLInputElement | null;

async function loadAuthor() {
    if (!authorId || isNaN(Number(authorId))) {
        if (nameAuthor) nameAuthor.textContent = 'Author not found';
        return;
    }

    try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

        const res = await fetch(`/authors/${authorId}`, { headers });

        if (!res.ok) {
            if (res.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
            } else {
                if (nameAuthor) nameAuthor.textContent = 'Author not found';
                if (biography) biography.textContent = '';
            }
            return;
        }

        const author: Author = await res.json();

        if (nameAuthor) nameAuthor.textContent = author.name_author || 'Unknown';
        if (biography) biography.textContent = author.biography || 'No biography available.';
        if (authorImage) authorImage.src = author.photo ? `/uploads/${author.photo}?t=${Date.now()}` : '/uploads/default-user.png';
    } catch (error) {
        if (nameAuthor) nameAuthor.textContent = 'Error loading author';
        if (biography) biography.textContent = '';
    }
}

saveAuthorBtn?.addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/';
        return;
    }

    const file = uploadInput?.files?.[0];
    const formData = new FormData();

    if (file) {
        formData.append('author_image', file);
    }

    try {
        const res = await fetch(`/authors/${authorId}/update`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        const data: { photo?: string; error?: string } = await res.json();

        if (res.ok) {
            if (data.photo && authorImage) {
                authorImage.src = `/uploads/${data.photo}?t=${Date.now()}`;
            }
            alert('Author updated!');
        } else {
            alert(data.error || 'Failed to update author');
        }
    } catch (error) {
        alert('Network error');
    }
});

loadAuthor();
