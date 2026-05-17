function loadProfile() {
    const user = getUser();

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("profile-name").innerText = user.name;
    document.getElementById("profile-username").innerText = user.username;
    document.getElementById("profile-email").innerText = user.email;
    document.getElementById("profile-role").innerText = user.roleName;
}

loadProfile();