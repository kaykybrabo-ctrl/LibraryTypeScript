document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form') as HTMLFormElement | null;
    const errorMessage = document.getElementById('error-message') as HTMLDivElement | null;
    const backButton = document.getElementById('back-button') as HTMLButtonElement | null;

    form?.addEventListener('submit', async (e: Event) => {
        e.preventDefault();
        if (!errorMessage) return;
        errorMessage.style.display = 'none';

        const formData = new FormData(form);
        const username = formData.get('username')?.toString().trim() || '';
        const password = formData.get('password')?.toString() || '';
        const confirmPassword = formData.get('confirm-password')?.toString() || '';

        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords don't match.";
            errorMessage.style.display = 'block';
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            if (response.status === 409) {
                errorMessage.textContent = 'Username already exists.';
                errorMessage.style.display = 'block';
                return;
            }

            if (!response.ok) {
                errorMessage.textContent = `Registration failed with status ${response.status}.`;
                errorMessage.style.display = 'block';
                return;
            }

            alert('User registered successfully!');
            window.location.href = '/interface/main.html';
        } catch {
            errorMessage.textContent = 'Network error, please try again later.';
            errorMessage.style.display = 'block';
        }
    });

    backButton?.addEventListener('click', () => {
        window.location.href = '/interface/main.html';
    });
});
