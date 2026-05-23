
async function register() {
    const fullname = document.getElementById('fullname').value.trim();
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value;
    if (!fullname || !username || !email || !phone || !password) { showToast('Vui lòng nhập đầy đủ thông tin', 'error'); return; }
    try {
        const result = await apiFetch(`${API_BASE_URL}/auth/register`, { method: 'POST', body: JSON.stringify({ fullname, username, email, phone, password }) });
        if (result.success) { showToast(result.message || 'Đăng ký thành công', 'success'); setTimeout(() => window.location.href = 'login.html', 1000); } else { showToast(result.message || 'Không thể đăng ký', 'error'); }
    } catch (error) { console.error(error); showToast('Không thể kết nối đến server', 'error'); }
}
