/**
 * all-projects.html: filter grids by genre (tags). Options built from card markup.
 */
(function () {
    var select = document.getElementById("projects-genre-filter-select");
    if (!select) {
        return;
    }

    var sections = document.querySelectorAll(".projects-page-section");
    var allCards = [];

    sections.forEach(function (section) {
        section.querySelectorAll(".projects-grid .project").forEach(function (card) {
            allCards.push(card);
        });
    });

    if (allCards.length === 0) {
        return;
    }

    var genreSet = new Set();
    allCards.forEach(function (card) {
        card.querySelectorAll(".tags .tag").forEach(function (el) {
            var t = el.textContent.trim();
            if (t) {
                genreSet.add(t);
            }
        });
    });

    var genres = Array.from(genreSet).sort(function (a, b) {
        return a.localeCompare(b, undefined, { sensitivity: "base" });
    });

    genres.forEach(function (g) {
        var opt = document.createElement("option");
        opt.value = g;
        opt.textContent = g;
        select.appendChild(opt);
    });

    var statusEl = document.getElementById("projects-genre-filter-status");

    function applyFilter() {
        var value = select.value;
        var showAll = value === "";

        var totalVisible = 0;

        sections.forEach(function (section) {
            var cards = section.querySelectorAll(".projects-grid .project");
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
                card.hidden = !show;
                if (show) {
                    n++;
                }
            });
            totalVisible += n;
            if (showAll) {
                section.hidden = false;
            } else {
                section.hidden = n === 0;
            }
        });

        if (statusEl) {
            if (showAll) {
                statusEl.textContent =
                    "Showing all " +
                    allCards.length +
                    " project" +
                    (allCards.length === 1 ? "" : "s") +
                    ".";
            } else if (totalVisible === 0) {
                statusEl.textContent =
                    "No projects tagged with “" + value + "”. Choose All or another genre.";
            } else {
                statusEl.textContent =
                    "Showing " +
                    totalVisible +
                    " project" +
                    (totalVisible === 1 ? "" : "s") +
                    " tagged with " +
                    value +
                    ".";
            }
        }
    }

    select.addEventListener("change", applyFilter);

    var params = new URLSearchParams(window.location.search);
    var preset = params.get("genre");
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

    applyFilter();
})();
