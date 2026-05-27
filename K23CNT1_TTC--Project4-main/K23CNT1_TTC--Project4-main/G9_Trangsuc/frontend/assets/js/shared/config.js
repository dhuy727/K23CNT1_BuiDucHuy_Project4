// Determine API base URL dynamically: explicit override -> same backend -> fallback
const API_BASE_URL = (function() {
    if (window.__API_BASE__) return window.__API_BASE__;
    const defaultBase = 'http://127.0.0.1:5000/api';
    try {
        if (window.location && window.location.protocol && window.location.protocol.startsWith('http')) {
            const hostname = window.location.hostname;
            const port = window.location.port || '80';
            if ((hostname === '127.0.0.1' || hostname === 'localhost') && port === '5000') {
                return `${window.location.protocol}//${hostname}:${port}/api`;
            }
        }
    } catch (e) {}
    return defaultBase;
})();

// expose for other scripts
window.API_BASE_URL = API_BASE_URL;

function getToken() {
    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") return null;
    return token;
}

function getCurrentUser() {
    const raw = localStorage.getItem("user");
    const token = getToken();
    if (!raw || !token) return null;
    try { return JSON.parse(raw); } catch (error) { return null; }
}

function getUser() { return getCurrentUser(); }

function saveUser(user) { localStorage.setItem("user", JSON.stringify(user)); }
function saveToken(token) { localStorage.setItem("token", token); }
function clearAuth() { localStorage.removeItem("token"); localStorage.removeItem("user"); }

function getCart() {
    try { return JSON.parse(localStorage.getItem("cart")) || []; }
    catch (error) { return []; }
}

function saveCart(cart) { localStorage.setItem("cart", JSON.stringify(cart)); }

function getWishlist() {
    try { return JSON.parse(localStorage.getItem("wishlist")) || []; }
    catch (error) { return []; }
}

function saveWishlist(list) { localStorage.setItem("wishlist", JSON.stringify(list)); }

function formatMoney(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + " VNĐ";
}

function formatDateTime(value) {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function getDisplayName(user) {
    if (!user) return "";
    return user.full_name || user.name || user.username || "Người dùng";
}

function getFirstLetter(user) {
    const name = getDisplayName(user).trim();
    return name ? name.charAt(0).toUpperCase() : "G";
}

function isAdminUser(user) {
    if (!user) return false;
    const role = String(user.role || user.roleName || "").toLowerCase();
    return role === "admin" || user.roleId === 1 || user.roleId === 2;
}
window.isAdminUser = isAdminUser;

function getLoginPath() {
    return window.location.pathname.includes("/admin/") ? "../user/login.html" : "login.html";
}

function checkLogin() {
    if (!getCurrentUser()) window.location.href = getLoginPath();
}

function checkAdmin() {
    if (!isAdminUser(getCurrentUser())) {
        alert("Bạn không có quyền truy cập trang quản trị");
        window.location.href = getLoginPath();
    }
}

function logout() {
    clearAuth();
    window.location.href = getLoginPath();
}

function authHeaders(extra = {}) {
    const headers = new Headers(extra);
    const token = getToken();
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    return headers;
}

async function apiFetch(url, options = {}) {
    const headers = authHeaders(options.headers || {});
    const hasBody = options.body !== undefined && options.body !== null;
    if (hasBody && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
        clearAuth();
    }
    let data = {};
    try { data = await response.json(); } catch (error) {}
    if (!response.ok && !data.message) data.message = `Yêu cầu thất bại (${response.status})`;
    return data;
}

function dispatchCartChanged() {
    window.dispatchEvent(new CustomEvent("g9:cart-changed"));
}

function getPageName() {
    return document.body?.dataset?.page || "";
}

function getBackendOrigin() {
    return String(API_BASE_URL || "")
        .replace(/\/api\/?$/, "")
        .replace(/\/$/, "");
}

function getImageUrl(image, folder = "uploads") {
    if (!image) return "https://via.placeholder.com/800x600?text=Luxury+Jewelry";
    const value = String(image).trim();
    if (!value) return "https://via.placeholder.com/800x600?text=Luxury+Jewelry";

    if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")) {
        return value;
    }

    const origin = getBackendOrigin();
    const cleanFolder = String(folder || "uploads").replace(/^\/+|\/+$/g, "");
    const cleanValue = value.replace(/\\/g, "/").replace(/^\/+/, "");
    const isNewsFolder = cleanFolder === "news";

    // Hỗ trợ cả filename thuần, đường dẫn uploads/... hoặc assets/..., và folder news dùng uploads
    if (cleanValue.startsWith("uploads/")) {
        return `${origin}/${cleanValue}`;
    }

    if (cleanValue.startsWith("assets/")) {
        return `${origin}/${cleanValue}`;
    }

    if (cleanValue.startsWith("news/")) {
        return `${origin}/uploads/${cleanValue.slice(5)}`;
    }

    if (isNewsFolder) {
        return `${origin}/uploads/${cleanValue}`;
    }

    // Nếu backend trả về một đường dẫn tương đối bất kỳ thì ghép theo origin backend
    if (cleanValue.includes("/")) {
        return `${origin}/${cleanValue}`;
    }

    return `${origin}/${cleanFolder}/${cleanValue}`;
}

// Alias an toàn cho các file JS khác dùng chung
window.g9GetImageUrl = getImageUrl;
window.g9GetCurrentUser = getCurrentUser;
window.g9GetDisplayName = getDisplayName;
window.g9FormatMoney = formatMoney;
window.g9EscapeHtml = escapeHtml;

window.getImageUrl = getImageUrl;
window.apiFetch = apiFetch;
window.getCurrentUser = getCurrentUser;
window.getDisplayName = getDisplayName;
window.formatMoney = formatMoney;
window.escapeHtml = escapeHtml;
window.dispatchCartChanged = dispatchCartChanged;
window.logout = logout;
