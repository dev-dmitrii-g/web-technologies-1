
"use strict";

(() => {
    const KEY = "tokyo-coffee-theme";
    let theme = localStorage.getItem(KEY) || "light";

    const darkCSS = `
        body { background:#171412 !important; color:#F3E6D0 !important; }
        header, nav, footer, .navbar, .navbar-collapse { background:#211A16 !important; }
        .card, .card-body, .modal-content, .list-group-item, .alert,
        .accordion-item, .dropdown-menu, .bg-light, .bg-white {
            background:#26201B !important; color:#F3E6D0 !important;
            border-color:#514033 !important;
        }
        h1,h2,h3,h4,h5,h6,p,li,label,legend,td,th,small,span,strong,em,
        blockquote,figcaption,caption,.text-dark,.text-body,.text-black,
        .link-dark,.nav-link,.navbar-brand { color:#F3E6D0 !important; }
        .text-muted,.text-secondary,.text-body-secondary { color:#C7B49B !important; }
        a:not(.btn) { color:#D5AD80; }
        input:not([type=checkbox]):not([type=radio]),textarea,select {
            background:#302720 !important; color:#F3E6D0 !important;
            border-color:#514033 !important;
        }
        input::placeholder,textarea::placeholder { color:#C7B49B !important; }
        .table {
            --bs-table-bg:#26201B; --bs-table-color:#F3E6D0;
            --bs-table-border-color:#514033; --bs-table-striped-bg:#302720;
            --bs-table-striped-color:#F3E6D0; --bs-table-hover-bg:#3A2D23;
            --bs-table-hover-color:#F3E6D0;
        }
        .btn-primary { background:#B78656 !important; color:#171412 !important; }
        .btn-secondary,.btn-dark { background:#49382A !important; color:#F3E6D0 !important; }
        .btn-success { background:#426B4A !important; color:white !important; }
        .btn-danger { background:#943F45 !important; color:white !important; }
        .btn-warning,.btn-info { background:#D5AD80 !important; color:#211A16 !important; }
        .btn-outline-primary,.btn-outline-secondary,.btn-outline-dark {
            color:#E5C39D !important; border-color:#B78656 !important;
        }
        .btn:hover { filter:brightness(1.1); }
        #theme-toggle { background:#F3E6D0 !important; color:#211A16 !important; }
        ::selection { background:#B78656; color:#171412; }
    `;

    function applyTheme() {
        document.getElementById("dark-style")?.remove();
        document.documentElement.style.colorScheme = theme;

        if (theme === "dark") {
            const style = document.createElement("style");
            style.id = "dark-style";
            style.textContent = darkCSS;
            document.head.appendChild(style);
        }
    }

    function init() {
        let button = document.getElementById("theme-toggle");

        if (!button) {
            button = document.createElement("button");
            button.id = "theme-toggle";
            button.type = "button";
            button.style.cssText =
                "position:fixed;right:20px;bottom:20px;z-index:9999;" +
                "padding:10px 16px;border-radius:28px;cursor:pointer;" +
                "border:1px solid #B78656;box-shadow:0 4px 16px #0003;";
            document.body.appendChild(button);
        }

        function update() {
            button.textContent = theme === "dark" ? "☀ Light Mode" : "🌙 Dark Mode";
            button.setAttribute("aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
            applyTheme();
        }

        button.addEventListener("click", () => {
            theme = theme === "dark" ? "light" : "dark";
            localStorage.setItem(KEY, theme);
            update();
        });

        update();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
