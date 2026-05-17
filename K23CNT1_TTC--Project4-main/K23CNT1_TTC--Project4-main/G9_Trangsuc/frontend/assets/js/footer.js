function renderFooter() {

    const footer = `
        <footer class="bg-dark text-white mt-5 py-5">

            <div class="container">

                <div class="row">

                    <div class="col-md-4">

                        <h4 class="text-warning">
                            G9 Trang Sức
                        </h4>

                        <p>
                            Website bán trang sức cao cấp,
                            vàng bạc, đá quý uy tín.
                        </p>

                    </div>

                    <div class="col-md-4">

                        <h5>Liên hệ</h5>

                        <p>Email: G9trangsuc@gmail.com</p>
                        <p>Hotline: 0988 888 888</p>

                    </div>

                    <div class="col-md-4">

                        <h5>Địa chỉ</h5>

                        <p>
                            Hà Nội, Việt Nam
                        </p>

                    </div>

                </div>

                <hr>

                <div class="text-center">

                    Copyright © G9 Trang Sức 2026

                </div>

            </div>

        </footer>
    `;

    document.getElementById("footer").innerHTML = footer;
}

renderFooter();