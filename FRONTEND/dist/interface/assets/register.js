"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');
    const backButton = document.getElementById('back-button');
    form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c;
        e.preventDefault();
        if (!errorMessage)
            return;
        errorMessage.style.display = 'none';
        const formData = new FormData(form);
        const username = ((_a = formData.get('username')) === null || _a === void 0 ? void 0 : _a.toString().trim()) || '';
        const password = ((_b = formData.get('password')) === null || _b === void 0 ? void 0 : _b.toString()) || '';
        const confirmPassword = ((_c = formData.get('confirm-password')) === null || _c === void 0 ? void 0 : _c.toString()) || '';
        if (password !== confirmPassword) {
            errorMessage.textContent = "Passwords don't match.";
            errorMessage.style.display = 'block';
            return;
        }
        try {
            const response = yield fetch('/register', {
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
        }
        catch (_d) {
            errorMessage.textContent = 'Network error, please try again later.';
            errorMessage.style.display = 'block';
        }
    }));
    backButton === null || backButton === void 0 ? void 0 : backButton.addEventListener('click', () => {
        window.location.href = '/interface/main.html';
    });
});
