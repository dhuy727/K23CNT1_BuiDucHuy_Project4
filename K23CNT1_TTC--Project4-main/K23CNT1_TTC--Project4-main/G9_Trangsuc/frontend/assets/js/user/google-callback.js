(function handleGoogleCallback() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userRaw = params.get('user');

    if (!token || !userRaw) {
        if (typeof showToast === 'function') {
            showToast('Thiếu thông tin đăng nhập từ Google', 'error');
        }
        window.location.replace('login.html');
        return;
    }

    let user;
    try {
        user = JSON.parse(userRaw);
    } catch (error) {
        if (typeof showToast === 'function') {
            showToast('Dữ liệu đăng nhập không hợp lệ', 'error');
        }
        window.location.replace('login.html');
        return;
    }

    saveToken(token);
    saveUser(user);
    dispatchCartChanged();

    if (typeof showToast === 'function') {
        showToast(`Xin chào ${getDisplayName(user)}!`, 'success');
    }

    const redirectPath = isAdminUser(user) ? '../admin/dashboard.html' : 'index.html';
    setTimeout(() => {
        window.location.replace(redirectPath);
    }, 600);
})();
