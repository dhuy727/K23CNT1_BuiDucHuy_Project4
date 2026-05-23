
function loadProfile() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }
    const fields = { 'profile-name': getDisplayName(user), 'profile-username': user.username || '', 'profile-email': user.email || '', 'profile-role': user.role || user.roleName || 'Khách hàng' };
    Object.entries(fields).forEach(([id, value]) => { const el = document.getElementById(id); if (el) el.textContent = value; });
}
document.addEventListener('DOMContentLoaded', loadProfile);
