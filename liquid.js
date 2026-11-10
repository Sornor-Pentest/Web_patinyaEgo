/* Hero search pill: forwards the query to the library search box. */
(function () {
  "use strict";
  var form = document.getElementById("hero-search");
  var heroInput = document.getElementById("hero-search-input");
  var library = document.getElementById("search");
  if (!form || !heroInput || !library) return;

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    library.value = heroInput.value;
    library.dispatchEvent(new Event("input", { bubbles: true }));
    var section = document.getElementById("library");
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  });
})();