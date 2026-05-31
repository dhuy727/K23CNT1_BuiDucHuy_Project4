
const loginForm = document.getElementById('loginForm');
const googleLoginBtn = document.getElementById('google-login');

function getGoogleLoginUrl() {
    const apiBase = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
    return `${apiBase}/auth/login/google`;
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', () => {
        window.location.href = getGoogleLoginUrl();
    });
}

(function showGoogleLoginError() {
    const params = new URLSearchParams(window.location.search);
    const message = params.get('message') || (params.get('google_error') ? 'Đăng nhập Google thất bại' : '');
    if (message && typeof showToast === 'function') {
        showToast(decodeURIComponent(message), 'error');
    }
})();

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const apiBase = window.API_BASE_URL || 'http://127.0.0.1:5000/api';
        const loginUrl = `${apiBase}/auth/login`;

        try {
            const result = await apiFetch(loginUrl, { method: 'POST', body: JSON.stringify({ username, password }) });
            if (result && result.success) {
                saveToken(result.token);
                saveUser(result.user);
                showToast(`Xin chào ${getDisplayName(result.user)}!`, 'success');
                dispatchCartChanged();
                setTimeout(() => {
                    const redirectPath = isAdminUser(result.user) ? '../admin/dashboard.html' : 'index.html';
                    window.location.href = redirectPath;
                }, 700);
            } else {
                showToast(result?.message || 'Đăng nhập không thành công', 'error');
            }
        } catch (error) {
            console.error('Login request failed:', error);
            showToast('Không thể kết nối đến server', 'error');
        }
    });
}
