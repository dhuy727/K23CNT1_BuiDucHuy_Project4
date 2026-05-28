
function loadProfile() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    const fields = {
        'profile-name': getDisplayName(user),
        'profile-username': user.username || '',
        'profile-email': user.email || '',
        'profile-role': user.role || user.roleName || 'Khách hàng'
    };
    Object.entries(fields).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = value; });

    const fullnameInput = document.getElementById('input-fullname');
    const usernameInput = document.getElementById('input-username');
    const emailInput = document.getElementById('input-email');
    const phoneInput = document.getElementById('input-phone');

    if (fullnameInput) fullnameInput.value = user.full_name || user.name || '';
    if (usernameInput) usernameInput.value = user.username || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';

    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }
}

async function updateProfile(event) {
    event.preventDefault();
    const fullname = document.getElementById('input-fullname')?.value.trim();
    const username = document.getElementById('input-username')?.value.trim();
    const email = document.getElementById('input-email')?.value.trim();
    const phone = document.getElementById('input-phone')?.value.trim();

    if (!fullname || !username || !email || !phone) {
        showToast('Vui lòng nhập đầy đủ thông tin', 'error');
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/user/profile`, {
            method: 'PUT',
            body: JSON.stringify({ fullname, username, email, phone })
        });

        if (result.success) {
            showToast(result.message || 'Cập nhật thành công', 'success');
            if (result.user) saveUser(result.user);
            if (result.token) saveToken(result.token);
            loadProfile();
        } else {
            showToast(result.message || 'Không thể cập nhật thông tin', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Không thể kết nối đến server', 'error');
    }
}

async function changePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('input-current-password')?.value;
    const newPassword = document.getElementById('input-new-password')?.value;
    const confirmPassword = document.getElementById('input-confirm-password')?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Vui lòng điền đầy đủ thông tin mật khẩu', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showToast('Mật khẩu mới và xác nhận không khớp', 'error');
        return;
    }

    try {
        const result = await apiFetch(`${API_BASE_URL}/user/change-password`, {
            method: 'PUT',
            body: JSON.stringify({ current_password: currentPassword, new_password: newPassword, confirm_password: confirmPassword })
        });

        if (result.success) {
            showToast(result.message || 'Đổi mật khẩu thành công', 'success');
            document.getElementById('input-current-password').value = '';
            document.getElementById('input-new-password').value = '';
            document.getElementById('input-confirm-password').value = '';
        } else {
            showToast(result.message || 'Không thể đổi mật khẩu', 'error');
        }
    } catch (error) {
        console.error(error);
        showToast('Không thể kết nối đến server', 'error');
    }
}

document.addEventListener('DOMContentLoaded', loadProfile);
