const newsParams = new URLSearchParams(window.location.search);
const newsId = newsParams.get("id");

async function loadNewsDetail() {
    const response = await fetch(`${API_BASE_URL}/bdh/news/${newsId}`);
    const item = await response.json();

    document.getElementById("news-title").innerText = item.title;
    document.getElementById("news-date").innerText = item.createdAt;
    document.getElementById("news-image").src = `assets/img/${item.image}`;
    document.getElementById("news-content").innerText = item.content;
}

loadNewsDetail();