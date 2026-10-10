// Häufige Fragen: Wenn eine Frage aufgeht, gehen die anderen zu.
document.querySelectorAll(".fragen details").forEach(function (frage) {
  frage.addEventListener("toggle", function () {
    if (!frage.open) return;
    document.querySelectorAll(".fragen details").forEach(function (andere) {
      if (andere !== frage) andere.open = false;
    });
  });
});
