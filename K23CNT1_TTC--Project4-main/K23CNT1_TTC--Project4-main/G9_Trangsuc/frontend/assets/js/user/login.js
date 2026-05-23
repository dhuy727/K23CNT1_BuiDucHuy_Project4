
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        try {
            const result = await apiFetch(`${API_BASE_URL}/auth/login`, { method: 'POST', body: JSON.stringify({ username, password }) });
            if (result.success) {
                saveToken(result.token);
                saveUser(result.user);
                showToast(`Xin chào ${getDisplayName(result.user)}!`, 'success');
                dispatchCartChanged();
                setTimeout(() => { window.location.href = String(result.user.role || '').toLowerCase() === 'admin' ? '../admin/dashboard.html' : 'index.html'; }, 700);
            } else {
                showToast(result.message || 'Đăng nhập không thành công', 'error');
            }
        } catch (error) { console.error(error); showToast('Không thể kết nối đến server', 'error'); }
    });
}
