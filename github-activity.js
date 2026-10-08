(function () {
  "use strict";

  var GH_USER = "TalhaHabib-hub";

  var SKILLS = {
    "Frontend": 82,
    "Backend": 68,
    "AI integration": 55,
    "Tools & Git": 75,
    "Databases": 60
  };

  var LANG_COLOR = {
    "JavaScript": "#eda100",
    "HTML": "#eb6834",
    "CSS": "#6250d6",
    "PHP": "#2a78d6",
    "Python": "#1baf7a",
    "C++": "#e87ba4",
    "TypeScript": "#2a78d6",
    "Java": "#e34948",
    "Blade": "#eb6834",
    "C": "#008300",
    "Shell": "#1baf7a"
  };

  var elRepos = document.getElementById("ghRepos");
  var elStars = document.getElementById("ghStars");
  var elLangs = document.getElementById("ghLangs");
  var elFollow = document.getElementById("ghFollow");
  var elStatus = document.getElementById("ghStatus");
  var elHeatmap = document.getElementById("ghHeatmap");
  var elHeatmapRange = document.getElementById("ghHeatmapRange");
  var elStackBar = document.getElementById("ghStackBar");
  var elStackBarLegend = document.getElementById("ghStackBarLegend");
  var elDonutLegend = document.getElementById("ghDonutLegend");

  var donutChart = null;
  var radarChart = null;

  var doughnutDepth = {
    id: "doughnutDepth",

    beforeDatasetsDraw: function (chart) {
      var meta = chart.getDatasetMeta(0);

      if (!meta || !meta.data.length) {
        return;
      }

      var ctx = chart.ctx;

      for (var layer = 10; layer > 0; layer--) {
        ctx.save();
        ctx.translate(0, layer * 1.15);
        ctx.globalAlpha = 0.16;

        meta.data.forEach(function (arc) {
          arc.draw(ctx);
        });

        ctx.restore();
      }
    }
  };

  var radarDepth = {
    id: "radarDepth",

    beforeDatasetsDraw: function (chart) {
      var meta = chart.getDatasetMeta(0);

      if (!meta || meta.data.length < 3) {
        return;
      }

      var ctx = chart.ctx;
      var points = meta.data;

      for (var layer = 8; layer > 0; layer--) {
        ctx.save();
        ctx.beginPath();
        points.forEach(function (point, index) {
          var x = point.x;
          var y = point.y + layer * 1.5;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.closePath();
        ctx.fillStyle = "rgba(20, 132, 145, 0.16)";
        ctx.strokeStyle = "rgba(45, 220, 210, 0.16)";
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  if (!elRepos) return;

  function animateCount(el, target) {
    if (!el) return;

    target = Number(target) || 0;

    var start = 0;
    var duration = 650;
    var startTime = performance.now();

    function tick(now) {
      var progress = Math.min(
        1,
        (now - startTime) / duration
      );

      var eased = 1 - Math.pow(1 - progress, 3);

      el.textContent = Math.round(
        start + (target - start) * eased
      );

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function colorFor(name, index) {
    return LANG_COLOR[name] || [
      "#2a78d6",
      "#eb6834",
      "#1baf7a",
      "#eda100",
      "#e87ba4",
      "#008300",
      "#6250d6",
      "#e34948"
    ][index % 8];
  }

  function topLanguages(byteTotals, limit) {
    return Object.keys(byteTotals)
      .map(function (name) {
        return {
          name: name,
          value: Number(byteTotals[name]) || 0
        };
      })
      .filter(function (item) {
        return item.value > 0;
      })
      .sort(function (a, b) {
        return b.value - a.value;
      })
      .slice(0, limit || 6);
  }

  /* =========================
     DONUT / PIE CHART
     ========================= */

  function renderDonut(langEntries) {
    var canvas = document.getElementById("ghDonut");

    if (
      !canvas ||
      !window.Chart ||
      !langEntries.length
    ) {
      return;
    }

    if (donutChart) {
      donutChart.destroy();
    }

    donutChart = new Chart(canvas, {
      type: "doughnut",

      plugins: [doughnutDepth],

      data: {
        labels: langEntries.map(function (x) {
          return x.name;
        }),

        datasets: [
          {
            data: langEntries.map(function (x) {
              return x.value;
            }),

            backgroundColor: langEntries.map(function (
              x,
              i
            ) {
              return colorFor(x.name, i);
            }),

            borderWidth: 0,

            hoverOffset: 5
          }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        cutout: "66%",

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              label: function (ctx) {
                var total =
                  ctx.dataset.data.reduce(
                    function (a, b) {
                      return a + b;
                    },
                    0
                  );

                var pct = total
                  ? Math.round(
                      (ctx.raw / total) * 100
                    )
                  : 0;

                return (
                  " " +
                  ctx.label +
                  ": " +
                  pct +
                  "%"
                );
              }
            }
          }
        }
      }
    });

    if (elDonutLegend) {
      elDonutLegend.innerHTML =
        langEntries
          .map(function (x, i) {
            return (
              '<div class="gh-donut-legend__item">' +
              '<span class="gh-donut-legend__dot" style="background:' +
              colorFor(x.name, i) +
              '"></span>' +
              "<span>" +
              x.name +
              "</span>" +
              "</div>"
            );
          })
          .join("");
    }
  }

  /* =========================
     LANGUAGE MIX BAR
     ========================= */

  function renderStackBar(langEntries) {
    if (
      !elStackBar ||
      !langEntries.length
    ) {
      return;
    }

    var total = langEntries.reduce(
      function (sum, x) {
        return sum + x.value;
      },
      0
    );

    elStackBar.innerHTML = "";

    if (elStackBarLegend) {
      elStackBarLegend.innerHTML = "";
    }

    langEntries.forEach(function (x, i) {
      var pct = total
        ? (x.value / total) * 100
        : 0;

      var segment =
        document.createElement("span");

      segment.className =
        "gh-stackbar__segment";

      segment.style.width =
        Math.max(pct, 1) + "%";

      segment.style.background =
        colorFor(x.name, i);

      segment.title =
        x.name +
        ": " +
        pct.toFixed(1) +
        "%";

      elStackBar.appendChild(segment);

      if (elStackBarLegend) {
        var item =
          document.createElement("span");

        item.className =
          "gh-stackbar__legend-item";

        item.innerHTML =
          '<span class="gh-stackbar__legend-dot" style="background:' +
          colorFor(x.name, i) +
          '"></span>' +
          x.name +
          " " +
          Math.round(pct) +
          "%";

        elStackBarLegend.appendChild(item);
      }
    });
  }

  /* =========================
     RADAR CHART
     ========================= */

  function renderRadar() {
    var canvas =
      document.getElementById("ghRadar");

    if (!canvas || !window.Chart) {
      return;
    }

    if (radarChart) {
      radarChart.destroy();
    }

    radarChart = new Chart(canvas, {
      type: "radar",

      plugins: [radarDepth],

      data: {
        labels: Object.keys(SKILLS),

        datasets: [
          {
            data: Object.keys(SKILLS).map(
              function (key) {
                return SKILLS[key];
              }
            ),

            borderWidth: 2,

            pointRadius: 3,

            pointHoverRadius: 5,

            fill: true,

            backgroundColor:
              "rgba(45, 220, 210, 0.14)",

            borderColor: "#2de0d0",

            pointBackgroundColor:
              "#2de0d0"
          }
        ]
      },

      options: {
        responsive: true,

        maintainAspectRatio: false,

        scales: {
          r: {
            min: 0,

            max: 100,

            ticks: {
              display: false,

              stepSize: 20
            },

            grid: {
              color:
                "rgba(150,170,190,.18)"
            },

            angleLines: {
              color:
                "rgba(150,170,190,.18)"
            },

            pointLabels: {
              color: "#aeb9ca",

              font: {
                size: 13
              }
            }
          }
        },

        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  }

  /* =========================
     GITHUB CONTRIBUTION HEATMAP
     ========================= */

  function renderHeatmap(contributions) {
    if (!elHeatmap) {
      return;
    }

    var cells = contributions
      .filter(function (x) {
        return x && x.date;
      })
      .slice(-91);

    elHeatmap.innerHTML = "";

    if (!cells.length) {
      return;
    }

    cells.forEach(function (c) {
      var cell =
        document.createElement("div");

      var level = Number(c.level);

      if (!Number.isFinite(level)) {
        var count =
          Number(c.count) || 0;

        level =
          count === 0
            ? 0
            : Math.min(
                4,
                Math.ceil(count / 4)
              );
      }

      cell.className =
        "gh-heatmap__cell";

      cell.setAttribute(
        "data-level",
        Math.max(
          0,
          Math.min(4, level)
        )
      );

      cell.title =
        c.date +
        ": " +
        (c.count || 0) +
        " contribution" +
        ((c.count || 0) === 1
          ? ""
          : "s");

      elHeatmap.appendChild(cell);
    });
  }

  /* =========================
     LOAD CONTRIBUTIONS
     ========================= */

  function loadContributionHeatmap() {
    var url =
      "https://github-contributions-api.jogruber.de/v4/" +
      encodeURIComponent(GH_USER) +
      "?y=last";

    fetch(url)
      .then(function (r) {
        if (!r.ok) {
          throw new Error(
            "Contribution API " +
              r.status
          );
        }

        return r.json();
      })

      .then(function (data) {
        var contributions =
          Array.isArray(
            data.contributions
          )
            ? data.contributions
            : [];

        renderHeatmap(contributions);

        if (elHeatmapRange) {
          elHeatmapRange.textContent =
            "Last 90 days of GitHub contributions";
        }
      })

      .catch(function () {
        if (elHeatmapRange) {
          elHeatmapRange.textContent =
            "GitHub contribution calendar temporarily unavailable";
        }
      });
  }

  /* =========================
     LOAD USER STATS
     ========================= */

  function loadUserStats() {
    return fetch(
      "https://api.github.com/users/" +
        encodeURIComponent(GH_USER)
    )

      .then(function (r) {
        if (!r.ok) {
          throw new Error(
            "User API " + r.status
          );
        }

        return r.json();
      })

      .then(function (user) {
        animateCount(
          elRepos,
          user.public_repos || 0
        );

        animateCount(
          elFollow,
          user.followers || 0
        );

        return user;
      });
  }

  /* =========================
     LOAD REPOSITORIES
     ========================= */

  function loadRepositories() {
    return fetch(
      "https://api.github.com/users/" +
        encodeURIComponent(GH_USER) +
        "/repos?per_page=100&sort=updated"
    )

      .then(function (r) {
        if (!r.ok) {
          throw new Error(
            "Repos API " + r.status
          );
        }

        return r.json();
      })

      .then(function (repos) {
        var totalStars =
          repos.reduce(
            function (sum, repo) {
              return (
                sum +
                (Number(
                  repo.stargazers_count
                ) || 0)
              );
            },
            0
          );

        animateCount(
          elStars,
          totalStars
        );

        var ownRepos =
          repos.filter(function (repo) {
            return !repo.fork;
          });

        /*
         * Fallback:
         * Use repository primary languages
         * if GitHub language endpoints fail.
         */

        var fallbackTotals = {};

        ownRepos.forEach(
          function (repo) {
            if (repo.language) {
              fallbackTotals[
                repo.language
              ] =
                (fallbackTotals[
                  repo.language
                ] || 0) + 1;
            }
          }
        );

        var requests =
          ownRepos.map(
            function (repo) {
              return fetch(
                repo.languages_url
              )

                .then(function (r) {
                  return r.ok
                    ? r.json()
                    : {};
                })

                .catch(function () {
                  return {};
                });
            }
          );

        return Promise.all(
          requests
        ).then(
          function (languageResults) {
            var byteTotals = {};

            languageResults.forEach(
              function (languages) {
                Object.keys(
                  languages
                ).forEach(
                  function (name) {
                    byteTotals[name] =
                      (byteTotals[name] ||
                        0) +
                      Number(
                        languages[name] ||
                          0
                      );
                  }
                );
              }
            );

            /*
             * If GitHub returned no
             * language data, use the
             * repository language
             * fallback.
             */

            if (
              !Object.keys(
                byteTotals
              ).length
            ) {
              byteTotals =
                fallbackTotals;
            }

            var entries =
              topLanguages(
                byteTotals,
                6
              );

            animateCount(
              elLangs,
              Object.keys(
                byteTotals
              ).length
            );

            /*
             * These two functions
             * create the missing graphs.
             */

            renderDonut(entries);

            renderStackBar(entries);
          }
        );
      });
  }

  /* =========================
     START EVERYTHING
     ========================= */

  function start() {

    /*
     * Each API works independently.
     * If one fails, the other graphs
     * can still load.
     */

    loadContributionHeatmap();

    loadUserStats().catch(
      function () {
        if (elRepos) {
          elRepos.textContent = "—";
        }

        if (elFollow) {
          elFollow.textContent = "—";
        }
      }
    );

    loadRepositories().catch(
      function () {
        if (elStars) {
          elStars.textContent = "—";
        }

        if (elLangs) {
          elLangs.textContent = "—";
        }
      }
    );

    renderRadar();
  }

  if (
    document.readyState ===
    "loading"
  ) {
    document.addEventListener(
      "DOMContentLoaded",
      start
    );
  } else {
    start();
  }

})();