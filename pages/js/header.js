const navLinks = [
    { name: "Menu", href: "menu.html" },
    { name: "Brewing Guides", href: "brewing-guides.html" },
    { name: "Events", href: "events.html" },
    { name: "About Us", href: "about.html" },
];

function createHeader(links) {
    const header = document.createElement("header");
    header.className = "font-monospace sticky-top";

    const linksHTML = links
        .map(
            (link) => `
      <a class="btn btn-light bg-white nav-link text-dark p-2 px-3" href="${link.href}">${link.name}</a>
  `,
        )
        .join("");

    header.innerHTML = `
    <nav class="navbar navbar-expand-lg bg-secondary">
      <div class="container-fluid">
        <a class="navbar-brand text-white" href="index.html"><b>Tokyo Coffee</b></a>
        <button class="navbar-toggler text-white border-primary" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
            <path fill-rule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"/>
          </svg>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <div class="d-flex gap-3 navbar-nav me-auto mb-2 mb-lg-0 py-2">
            ${linksHTML}
          </div>
          <a id="login-button-header" class="btn btn-primary font-monospace d-inline-flex align-items-center justify-content-center justify-content-md-start gap-2 p-2 px-3" href="login.html">
            Login
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-door-open-fill" viewBox="0 0 16 16">
              <path d="M1.5 15a.5.5 0 0 0 0 1h13a.5.5 0 0 0 0-1H13V2.5A1.5 1.5 0 0 0 11.5 1H11V.5a.5.5 0 0 0-.57-.495l-7 1A.5.5 0 0 0 3 1.5V15zM11 2h.5a.5.5 0 0 1 .5.5V15h-1zm-2.5 8c-.276 0-.5-.448-.5-1s.224-1 .5-1 .5.448.5 1-.224 1-.5 1"/>
            </svg>
          </a>
        </div>
      </div>
    </nav>
    <hr class="my-0" />
  `;

    return header;
}

document.body.prepend(createHeader(navLinks));
