async function loadNews() {
    const response = await fetch(`${API_BASE_URL}/bdh/news/`);
    const news = await response.json();

    let html = "";

    news.forEach(item => {
        html += `
            <div class="col-md-4 mb-4">
                <div class="card h-100 shadow-sm">

                    <img src="assets/img/${item.image}" 
                         class="card-img-top" 
                         style="height:220px; object-fit:cover;">

                    <div class="card-body">

                        <h5>${item.title}</h5>

                        <p>${item.shortDescription}</p>

                        <small class="text-muted">
                            ${item.category || ""}
                        </small>

                        <br>

                        <a href="news-detail.html?id=${item.id}" 
                           class="btn btn-dark btn-sm mt-3">
                            Xem chi tiết
                        </a>

                    </div>
                </div>
            </div>
        `;
    });

    const newsList = document.getElementById("news-list");

    if (newsList) {
        newsList.innerHTML = html;
    }
}

loadNews();