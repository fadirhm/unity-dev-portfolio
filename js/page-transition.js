/**
 * Directional slide transitions between portfolio pages (MPA).
 * Forward: current exits left, next enters from right.
 * Back: current exits right, destination enters from left.
 */
(function () {
    var STORAGE_KEY = "portfolioNavDir";
    var shellClass = "page-transition-shell";

    function prefersReducedMotion() {
        return (
            window.matchMedia &&
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        );
    }

    function normalizeParts(pathname) {
        return pathname
            .split("/")
            .filter(function (s) {
                return s && s !== "index.html";
            });
    }

    /** Heuristic: shallower path = back toward home */
    function navDirectionForUrl(targetUrl) {
        try {
            var u = new URL(targetUrl, location.href);
            if (u.origin !== location.origin) {
                return null;
            }
            if (u.pathname === location.pathname && u.hash && !u.search) {
                return null;
            }
            var a = normalizeParts(location.pathname);
            var b = normalizeParts(u.pathname);
            if (b.length < a.length) {
                return "back";
            }
            if (b.length > a.length) {
                return "forward";
            }
            return "forward";
        } catch (e) {
            return null;
        }
    }

    function shouldSkipAnchor(a) {
        if (!a || !a.getAttribute("href")) {
            return true;
        }
        var href = a.getAttribute("href");
        if (
            href.startsWith("#") ||
            href.startsWith("mailto:") ||
            href.startsWith("tel:") ||
            href.startsWith("javascript:")
        ) {
            return true;
        }
        if (a.target === "_blank" || a.hasAttribute("download")) {
            return true;
        }
        try {
            var u = new URL(a.href, location.href);
            if (u.origin !== location.origin) {
                return true;
            }
        } catch (e) {
            return true;
        }
        return false;
    }

    function wrapShell() {
        var header = document.querySelector(".site-header");
        var container = document.querySelector(".container");
        if (!header || !container || document.querySelector("." + shellClass)) {
            return null;
        }
        var shell = document.createElement("div");
        shell.className = shellClass;
        shell.setAttribute("data-page-transition", "");
        header.parentNode.insertBefore(shell, header);
        shell.appendChild(header);
        shell.appendChild(container);
        return shell;
    }

    function applyEnterAnimation(shell, dir) {
        if (!dir || !shell) {
            return;
        }
        if (prefersReducedMotion()) {
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch (err) {}
            return;
        }
        var cls = dir === "back" ? "pt-enter-back" : "pt-enter-forward";
        shell.classList.add(cls);
        var onEnd = function (e) {
            if (e.target !== shell) {
                return;
            }
            shell.removeEventListener("animationend", onEnd);
            shell.classList.remove("pt-enter-forward", "pt-enter-back");
            try {
                sessionStorage.removeItem(STORAGE_KEY);
            } catch (err) {}
        };
        shell.addEventListener("animationend", onEnd);
    }

    function navigateWithTransition(href, dir) {
        var shell = document.querySelector("." + shellClass);
        if (!shell || prefersReducedMotion()) {
            try {
                sessionStorage.setItem(STORAGE_KEY, dir);
            } catch (e) {}
            window.location.href = href;
            return;
        }
        try {
            sessionStorage.setItem(STORAGE_KEY, dir);
        } catch (e) {}
        var exitCls = dir === "back" ? "pt-exit-back" : "pt-exit-forward";
        var done = false;
        function go() {
            if (done) {
                return;
            }
            done = true;
            window.location.href = href;
        }
        shell.addEventListener(
            "animationend",
            function (e) {
                if (e.target === shell) {
                    go();
                }
            },
            { once: true }
        );
        shell.classList.add(exitCls);
        window.setTimeout(go, 520);
    }

    document.addEventListener(
        "click",
        function (e) {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
                return;
            }
            var a = e.target.closest("a");
            if (!a || shouldSkipAnchor(a)) {
                return;
            }
            var dir = navDirectionForUrl(a.href);
            if (!dir) {
                return;
            }
            e.preventDefault();
            navigateWithTransition(a.href, dir);
        },
        true
    );

    window.addEventListener("DOMContentLoaded", function () {
        var shell = wrapShell();
        if (!shell) {
            return;
        }

        var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        if (nav && nav.type === "back_forward") {
            try {
                if (!sessionStorage.getItem(STORAGE_KEY)) {
                    sessionStorage.setItem(STORAGE_KEY, "back");
                }
            } catch (e) {}
        }

        var dir = null;
        try {
            dir = sessionStorage.getItem(STORAGE_KEY);
        } catch (e) {}

        if (dir === "forward" || dir === "back") {
            applyEnterAnimation(shell, dir);
        }
    });
})();
