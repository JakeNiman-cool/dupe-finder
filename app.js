// Complete updated app.js

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");
  const resultsContainer = document.getElementById("results-container");
  const noDupesMessage = document.getElementById("no-dupes-message");

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      
      if (!query) return;

      // Show loading or clear previous results
      if (resultsContainer) resultsContainer.innerHTML = "<p>Searching for deals...</p>";
      if (noDupesMessage) noDupesMessage.style.display = "none";

      try {
        const response = await fetch(`/api/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();

        // FIXED: Now correctly grabbing data.organic from your backend
        const items = data.organic || [];

        if (items.length === 0) {
          // Show the "No Dupes Right Now" message if nothing is found
          if (resultsContainer) resultsContainer.innerHTML = "";
          if (noDupesMessage) noDupesMessage.style.display = "block";
        } else {
          // Hide error message and render the actual results/deals
          if (noDupesMessage) noDupesMessage.style.display = "none";
          renderResults(items);
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (resultsContainer) resultsContainer.innerHTML = "<p>Error loading deals. Try again.</p>";
      }
    });
  }

  function renderResults(items) {
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "dupe-card"; // Adjust class name to match your CSS if needed
      
      card.innerHTML = `
        <h3><a href="${item.link}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
        <p>${item.snippet || "No description available."}</p>
        <span class="site-name">${item.displayed_link || item.link}</span>
      `;
      
      resultsContainer.appendChild(card);
    });
  }
});
