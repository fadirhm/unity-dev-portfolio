/**
 * Directional slide transitions between portfolio pages (MPA).
 * Forward: current exits left, next enters from right.
 * Back: current exits right, destination enters from left.
 */
(function () {
    var STORAGE_KEY = "portfolioNavDir";
    var STORAGE_SKIP_ENTER = "portfolioNavSkipEnter";
    var shellClass = "page-transition-shell";
    var TRANSITION_MS = 520;

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
        var container = document.querySelector(".container");
        if (!container || document.querySelector("." + shellClass)) {
            return null;
        }
        var shell = document.createElement("div");
        shell.className = shellClass;
        shell.setAttribute("data-page-transition", "");
        container.parentNode.insertBefore(shell, container);
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
                sessionStorage.removeItem(STORAGE_SKIP_ENTER);
                sessionStorage.setItem(STORAGE_KEY, dir);
            } catch (e) {}
            window.location.href = href;
            return;
        }
        try {
            sessionStorage.setItem(STORAGE_SKIP_ENTER, "1");
            sessionStorage.setItem(STORAGE_KEY, dir);
        } catch (e) {}

        var wipe = document.createElement("div");
        wipe.className =
            "pt-transition-wipe pt-transition-wipe--" +
            (dir === "back" ? "back" : "forward");
        wipe.setAttribute("aria-hidden", "true");
        shell.parentNode.insertBefore(wipe, shell);

        var exitCls = dir === "back" ? "pt-exit-back" : "pt-exit-forward";
        var done = false;
        function go() {
            if (done) {
                return;
            }
            done = true;
            window.location.href = href;
        }

        function armGoFrom(el) {
            if (!el) {
                return;
            }
            el.addEventListener(
                "animationend",
                function (e) {
                    if (e.target === el) {
                        go();
                    }
                },
                { once: true }
            );
        }

        armGoFrom(shell);
        armGoFrom(wipe);
        window.requestAnimationFrame(function () {
            wipe.classList.add("pt-transition-wipe--run");
            shell.classList.add(exitCls);
        });
        window.setTimeout(go, TRANSITION_MS);
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

        var skipEnter = false;
        try {
            skipEnter = sessionStorage.getItem(STORAGE_SKIP_ENTER) === "1";
            if (skipEnter) {
                sessionStorage.removeItem(STORAGE_SKIP_ENTER);
                sessionStorage.removeItem(STORAGE_KEY);
            }
        } catch (e) {}

        if (skipEnter) {
            return;
        }

        var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        if (nav && nav.type === "back_forward") {
            try {
                if (!sessionStorage.getItem(STORAGE_KEY)) {
                    sessionStorage.setItem(STORAGE_KEY, "back");
                }
            } catch (e2) {}
        }

        var dir = null;
        try {
            dir = sessionStorage.getItem(STORAGE_KEY);
        } catch (e3) {}

        if (dir === "forward" || dir === "back") {
            applyEnterAnimation(shell, dir);
        }
    });
})();
