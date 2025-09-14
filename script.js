const API_KEY = "26d0fdb46eef47ff9ba8d259bfe9661c"; 
const resultsContainer = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const genreSelect = document.getElementById("genreSelect");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

async function fetchGames(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data.results || [];
}

async function fetchGenres() {
  const url = `https://api.rawg.io/api/genres?key=${API_KEY}`;
  const response = await fetch(url);
  const data = await response.json();
  genreSelect.innerHTML = `<option value="">Todos los géneros</option>`;
  data.results.forEach(genre => {
    const option = document.createElement("option");
    option.value = genre.slug;
    option.textContent = genre.name;
    genreSelect.appendChild(option);
  });
}

function renderGames(games) {
  resultsContainer.innerHTML = "";
  if (games.length === 0) {
    resultsContainer.innerHTML = "<p>No se encontraron juegos.</p>";
    return;
  }

  games.forEach(game => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${game.background_image}" alt="${game.name}">
      <div class="card-content">
        <h3>${game.name}</h3>
        <p><strong>Rating:</strong> ${game.rating} ⭐</p>
        <p><strong>Lanzamiento:</strong> ${game.released || "N/D"}</p>
        <button data-id="${game.id}">Ver más</button>
      </div>
    `;

    resultsContainer.appendChild(card);
  });

  document.querySelectorAll(".card button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-id");
      const details = await fetchGameDetails(id);
      modalBody.innerHTML = `
        <h2>${details.name}</h2>
        <img src="${details.background_image}" style="width:100%; border-radius:8px; margin:1rem 0;">
        <p><strong>Metacritic:</strong> ${details.metacritic || "N/D"}</p>
        <p><strong>Plataformas:</strong> ${details.platforms.map(p => p.platform.name).join(", ")}</p>
        <h3>Descripción</h3>
        <p>${details.description_raw || "Sin descripción disponible."}</p>
      `;
      modal.style.display = "block";
    });
  });
}

async function fetchGameDetails(id) {
  const url = `https://api.rawg.io/api/games/${id}?key=${API_KEY}`;
  const response = await fetch(url);
  return await response.json();
}

async function loadFeaturedGames() {
  const url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=12`;
  const games = await fetchGames(url);
  renderGames(games);
}

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  let url = `https://api.rawg.io/api/games?key=${API_KEY}&page_size=12`;
  if (query) url += `&search=${query}`;
  if (genreSelect.value) url += `&genres=${genreSelect.value}`;
  const games = await fetchGames(url);
  renderGames(games);
});

genreSelect.addEventListener("change", () => searchBtn.click());
searchInput.addEventListener("keypress", e => { if (e.key === "Enter") searchBtn.click(); });
closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

fetchGenres();
loadFeaturedGames();
