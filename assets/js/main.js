// main.js — Grifts homepage interactions

document.addEventListener("DOMContentLoaded", () => {
    const search = document.getElementById("toolSearch");
    const cards = Array.from(document.querySelectorAll(".card"));
    
    if (!search) return;

    let searchTimeout;

    // Function to run the search logic
    const runSearch = (q) => {
        cards.forEach(card => {
            const title = card.dataset.title.toLowerCase();
            if (title.includes(q)) {
                card.style.display = "";
                // Only add highlight if it's a new match
                if (!card.classList.contains("highlight")) {
                    card.classList.add("highlight");
                }
            } else {
                card.style.display = "none";
                card.classList.remove("highlight");
            }
        });
    };

    // Event listener for cleanup after the CSS animation ends
    cards.forEach(card => {
        card.addEventListener('animationend', () => {
            card.classList.remove("highlight");
        });
    });

    // Debounced input handler for better performance
    search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        
        // Clear the previous timer
        clearTimeout(searchTimeout); 

        // Set a new timer (250ms is a good balance for responsiveness)
        searchTimeout = setTimeout(() => {
            runSearch(q);
        }, 250); 
    });
});
