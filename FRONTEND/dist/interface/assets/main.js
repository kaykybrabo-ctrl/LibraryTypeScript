var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const form = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');
const registerBtn = document.getElementById('register-btn');
form === null || form === void 0 ? void 0 : form.addEventListener('submit', (e) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    e.preventDefault();
    if (!form)
        return;
    if (errorMessage)
        errorMessage.style.display = 'none';
    const formData = new FormData(form);
    const username = ((_a = formData.get('username')) === null || _a === void 0 ? void 0 : _a.toString().trim()) || '';
    const password = ((_b = formData.get('password')) === null || _b === void 0 ? void 0 : _b.toString()) || '';
    try {
        const res = yield fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        let data;
        try {
            data = yield res.json();
        }
        catch (_c) {
            if (errorMessage) {
                errorMessage.textContent = 'Invalid server response';
                errorMessage.style.display = 'block';
            }
            return;
        }
        if (!res.ok) {
            const errMsg = data.error || 'Login failed';
            if (errorMessage) {
                errorMessage.textContent = errMsg;
                errorMessage.style.display = 'block';
            }
            return;
        }
        const successData = data;
        localStorage.setItem('token', successData.token);
        localStorage.setItem('username', successData.username);
        if (successData.role === 'admin') {
            window.location.href = '/index.html';
        }
        else {
            window.location.href = '/user.html';
        }
    }
    catch (_d) {
        if (errorMessage) {
            errorMessage.textContent = 'Network error';
            errorMessage.style.display = 'block';
        }
    }
}));
registerBtn === null || registerBtn === void 0 ? void 0 : registerBtn.addEventListener('click', () => {
    window.location.href = '/interface/register.html';
});
export { };
