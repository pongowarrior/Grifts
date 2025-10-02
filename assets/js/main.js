// main.js — Grifts homepage interactions

document.addEventListener("DOMContentLoaded", () => {
  const search = document.getElementById("toolSearch");
  const cards = Array.from(document.querySelectorAll(".card"));
  
  if (!search) return;
  
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    
    cards.forEach(card => {
      const title = card.dataset.title.toLowerCase();
      if (title.includes(q)) {
        card.style.display = "";
        card.classList.add("highlight");
      } else {
        card.style.display = "none";
        card.classList.remove("highlight");
      }
    });
  });
});