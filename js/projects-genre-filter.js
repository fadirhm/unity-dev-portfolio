/**
 * all-projects.html: per-section genre filters. Options = tags present on cards in that section only.
 * Uses a class for hiding cards (display !important) because .project { display: flex } can override [hidden].
 */
(function () {
    var roots = document.querySelectorAll(".js-genre-filter");
    if (!roots.length) {
        return;
    }

    var params = new URLSearchParams(window.location.search);

    function collectGenres(cards) {
        var genreSet = new Set();
        cards.forEach(function (card) {
            card.querySelectorAll(".tags .tag").forEach(function (el) {
                var t = el.textContent.trim();
                if (t) {
                    genreSet.add(t);
                }
            });
        });
        return Array.from(genreSet).sort(function (a, b) {
            return a.localeCompare(b, undefined, { sensitivity: "base" });
        });
    }

    function initFilter(root) {
        var section = root.closest(".projects-page-section");
        if (!section) {
            return;
        }

        var grid = section.querySelector(".projects-grid");
        if (!grid) {
            return;
        }

        var select = root.querySelector(".projects-genre-filter__select");
        var statusEl = root.querySelector(".projects-genre-filter__status");
        if (!select) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll(".project"));
        if (cards.length === 0) {
            return;
        }

        var genres = collectGenres(cards);
        genres.forEach(function (g) {
            var opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            select.appendChild(opt);
        });

        var label = section.querySelector(".projects-page-section__title");
        var sectionShort = label ? label.textContent.trim() : "this section";

        function applyFilter() {
            var value = select.value;
            var showAll = value === "";

            var n = 0;
            cards.forEach(function (card) {
                var show = showAll;
                if (!show) {
                    card.querySelectorAll(".tags .tag").forEach(function (el) {
                        if (el.textContent.trim() === value) {
                            show = true;
                        }
                    });
                }
                card.classList.toggle("project--genre-hidden", !show);
                if (show) {
                    n++;
                }
            });

            if (statusEl) {
                if (showAll) {
                    statusEl.textContent =
                        "Showing all " +
                        cards.length +
                        " project" +
                        (cards.length === 1 ? "" : "s") +
                        " in " +
                        sectionShort +
                        ".";
                } else if (n === 0) {
                    statusEl.textContent =
                        "No projects in " +
                        sectionShort +
                        " tagged with “" +
                        value +
                        "”. Choose All or another genre.";
                } else {
                    statusEl.textContent =
                        "Showing " +
                        n +
                        " of " +
                        cards.length +
                        " project" +
                        (n === 1 ? "" : "s") +
                        " tagged with " +
                        value +
                        " (" +
                        sectionShort +
                        ").";
                }
            }
        }

        select.addEventListener("change", applyFilter);

        var paramKey = select.getAttribute("data-genre-url-param");
        if (paramKey) {
            var preset = params.get(paramKey);
            if (!preset && paramKey === "solo_genre") {
                preset = params.get("genre");
            }
            if (preset) {
                var decoded = preset.replace(/\+/g, " ").trim();
                var match = null;
                for (var i = 0; i < genres.length; i++) {
                    if (genres[i].toLowerCase() === decoded.toLowerCase()) {
                        match = genres[i];
                        break;
                    }
                }
                if (match) {
                    select.value = match;
                }
            }
        }

        applyFilter();
    }

    roots.forEach(initFilter);
})();
