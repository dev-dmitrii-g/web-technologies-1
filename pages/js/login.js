function loading() {
    const body = document.body;

    const wrapper = document.createElement("div");
    wrapper.id = "loading-overlay";

    wrapper.className =
        "position-fixed top-0 start-0 w-100 h-100 bg-secondary d-flex align-items-center justify-content-center";

    wrapper.style.zIndex = "9999";
    wrapper.style.height = "100vh";

    const loadingDisplay = document.createElement("div");
    loadingDisplay.className = "h1 text-white d-flex gap-4 align-items-center";

    const svgNS = "http://www.w3.org/2000/svg";

    const loadingIcon = document.createElementNS(svgNS, "svg");

    loadingIcon.setAttribute("width", "32");
    loadingIcon.setAttribute("height", "32");
    loadingIcon.setAttribute("fill", "currentColor");
    loadingIcon.setAttribute("viewBox", "0 0 16 16");

    loadingIcon.classList.add("bi", "bi-brilliance", "loading-icon");

    const loadingIconPath = document.createElementNS(svgNS, "path");

    loadingIconPath.setAttribute(
        "d",
        "M8 16A8 8 0 1 1 8 0a8 8 0 0 1 0 16M1 8a7 7 0 0 0 7 7 3.5 3.5 0 1 0 0-7 3.5 3.5 0 1 1 0-7 7 7 0 0 0-7 7",
    );

    loadingIcon.appendChild(loadingIconPath);

    loadingDisplay.appendChild(loadingIcon);
    wrapper.appendChild(loadingDisplay);

    body.appendChild(wrapper);
}

function stopLoading() {
    const overlay = document.getElementById("loading-overlay");

    if (!overlay) return;

    overlay.classList.add("fade-out");

    overlay.addEventListener("transitionend", () => overlay.remove(), {
        once: true,
    });
}

const form = document.getElementById("login-form");

form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const email = data.get("email");
    const password = data.get("password");

    console.log(email);
    console.log(password);

    loading();

    setTimeout(() => {
        stopLoading();
        window.location.replace("./index.html");
    }, 1000);
});
