/**
 * Injects sticky site header on every page. Requires this script as the first child of <body>.
 * GitHub Pages: site lives under /unity-dev-portfolio/
 */
(function () {
    var BASE = (function () {
        var parts = location.pathname.split("/").filter(Boolean);
        var idx = parts.indexOf("unity-dev-portfolio");
        if (idx >= 0) {
            return "/" + parts.slice(0, idx + 1).join("/");
        }
        return "";
    })();

    function homeHref() {
        if (BASE) {
            return BASE + "/index.html";
        }
        if (location.pathname.indexOf("/projects/") !== -1) {
            return "../../index.html";
        }
        return "index.html";
    }

    function resumeHref() {
        if (BASE) {
            return BASE + "/resume/Resume.pdf";
        }
        if (location.pathname.indexOf("/projects/") !== -1) {
            return "../../resume/Resume.pdf";
        }
        return "resume/Resume.pdf";
    }

    function profileImgSrc() {
        // Must match repo folder name: GitHub Pages is case-sensitive ("Images" not "images").
        if (BASE) {
            return BASE + "/Images/profile.jpg";
        }
        if (location.pathname.indexOf("/projects/") !== -1) {
            return "../../Images/profile.jpg";
        }
        return "Images/profile.jpg";
    }

    /** Full hero (photo + bio) only on main portfolio landing — not on project pages or all-projects */
    function isPortfolioHome() {
        var p = location.pathname.replace(/\\/g, "/");
        if (p.indexOf("/projects/") !== -1) {
            return false;
        }
        if (p.indexOf("all-projects.html") !== -1) {
            return false;
        }
        return true;
    }

    var linkedin = "https://www.linkedin.com/in/fahad-ansari-700152212";
    var github = "https://github.com/fadirhm";

    var svgLinkedIn =
        '<svg class="site-header__icon" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>';

    var svgGithub =
        '<svg class="site-header__icon" width="30" height="30" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';

    var heroBlock = "";
    if (isPortfolioHome()) {
        heroBlock =
            '<div class="site-header__hero">' +
            '<div class="site-header__hero-inner">' +
            '<div class="site-header__avatar-wrap">' +
            '<img class="site-header__avatar" src="' +
            profileImgSrc() +
            '" alt="Portrait of Fahad Ansari" width="200" height="200" loading="eager" decoding="async">' +
            "</div>" +
            '<p class="site-header__bio">Unity and gameplay programmer specializing in systems architecture and player-facing mechanics — focused on efficient C#, scalable tooling, and shipping polished mobile games.</p>' +
            "</div>" +
            "</div>";
    }

    var html =
        '<header class="site-header">' +
        '<div class="site-header__sticky">' +
        '<div class="site-header__inner site-header__top">' +
        '<a class="site-header__brand" href="' +
        homeHref() +
        '">' +
        '<span class="site-header__name">Fahad Ansari</span>' +
        '<span class="site-header__role">Game Programmer</span>' +
        "</a>" +
        '<nav class="site-header__nav" aria-label="Social and resume">' +
        '<a class="site-header__icon-link" href="' +
        linkedin +
        '" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">' +
        svgLinkedIn +
        "</a>" +
        '<a class="site-header__icon-link" href="' +
        github +
        '" target="_blank" rel="noopener noreferrer" aria-label="GitHub">' +
        svgGithub +
        "</a>" +
        '<a class="site-header__resume" href="' +
        resumeHref() +
        '" download="Fahad-Ansari-Resume.pdf">Resume <span class="site-header__resume-arrow" aria-hidden="true">↓</span></a>' +
        "</nav>" +
        "</div>" +
        "</div>" +
        "</header>";

    document.body.insertAdjacentHTML("afterbegin", html);

    /* Hero goes inside .container after DOM is parsed (script runs before .container exists) */
    function injectHomeHero() {
        if (!heroBlock) {
            return;
        }
        var container = document.querySelector(".container");
        if (container) {
            container.insertAdjacentHTML("afterbegin", heroBlock);
        }
    }
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", injectHomeHero);
    } else {
        injectHomeHero();
    }
})();
