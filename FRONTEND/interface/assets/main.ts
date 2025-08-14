import type { UserProfile } from '../../assets/types';

const form = document.getElementById('login-form') as HTMLFormElement | null;
const errorMessage = document.getElementById('error-message') as HTMLElement | null;
const registerBtn = document.getElementById('register-btn') as HTMLButtonElement | null;

interface LoginResponseSuccess {
    token: string;
    role: 'admin' | 'user';
    username: string;
    id: number;
}

interface LoginResponseError {
    error: string;
}

type LoginResponse = LoginResponseSuccess | LoginResponseError;

form?.addEventListener('submit', async (e: Event) => {
    e.preventDefault();

    if (!form) return;
    if (errorMessage) errorMessage.style.display = 'none';

    const formData = new FormData(form);
    const username = formData.get('username')?.toString().trim() || '';
    const password = formData.get('password')?.toString() || '';

    try {
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        let data: LoginResponse;
        try {
            data = await res.json();
        } catch {
            if (errorMessage) {
                errorMessage.textContent = 'Invalid server response';
                errorMessage.style.display = 'block';
            }
            return;
        }

        if (!res.ok) {
            const errMsg = (data as LoginResponseError).error || 'Login failed';
            if (errorMessage) {
                errorMessage.textContent = errMsg;
                errorMessage.style.display = 'block';
            }
            return;
        }

        const successData = data as LoginResponseSuccess;
        localStorage.setItem('token', successData.token);
        localStorage.setItem('username', successData.username);

        if (successData.role === 'admin') {
            window.location.href = '/index.html';
        } else {
            window.location.href = '/user.html';
        }
    } catch {
        if (errorMessage) {
            errorMessage.textContent = 'Network error';
            errorMessage.style.display = 'block';
        }
    }
});

registerBtn?.addEventListener('click', () => {
    window.location.href = '/interface/register.html';
});
