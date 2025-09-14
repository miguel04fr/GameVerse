const resultsContainer = document.getElementById("results");
const searchBtn = document.getElementById("searchBtn");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("modal");
const modalBody = document.getElementById("modalBody");
const closeModal = document.getElementById("closeModal");

async function fetchCoins(query) {
  const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${query}&order=market_cap_desc&per_page=6&page=1&sparkline=false`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    return [];
  }
}

async function fetchCoinDetails(id) {
  const url = `https://api.coingecko.com/api/v3/coins/${id}`;
  try {
    const response = await fetch(url);
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchWikipediaSummary(coinName) {
  const url = `https://es.wikipedia.org/api/rest_v1/page/summary/${coinName}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    return data.extract;
  } catch {
    return null;
  }
}

function renderCoins(coins) {
  resultsContainer.innerHTML = "";

  if (coins.length === 0) {
    resultsContainer.innerHTML = "<p>No se encontraron criptomonedas.</p>";
    return;
  }

  coins.forEach(coin => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <img src="${coin.image}" alt="${coin.name}">
      <h3>${coin.name} (${coin.symbol.toUpperCase()})</h3>
      <p><strong>Precio:</strong> $${coin.current_price}</p>
      <p><strong>Cambio 24h:</strong> ${coin.price_change_percentage_24h.toFixed(2)}%</p>
      <button data-id="${coin.id}" data-name="${coin.name}">Ver más</button>
    `;

    resultsContainer.appendChild(card);
  });

  document.querySelectorAll(".card button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const coinId = btn.getAttribute("data-id");
      const coinName = btn.getAttribute("data-name");
      const details = await fetchCoinDetails(coinId);
      const wiki = await fetchWikipediaSummary(coinName);

      modalBody.innerHTML = `
        <h2>${details.name} (${details.symbol.toUpperCase()})</h2>
        <img src="${details.image.large}" alt="${details.name}" style="max-width:100px; margin:1rem 0;">
        <p><strong>Ranking:</strong> #${details.market_cap_rank}</p>
        <p><strong>Capitalización:</strong> $${details.market_data.market_cap.usd.toLocaleString()}</p>
        <p><strong>Precio actual:</strong> $${details.market_data.current_price.usd}</p>
        <p><strong>Cambio 24h:</strong> ${details.market_data.price_change_percentage_24h.toFixed(2)}%</p>
        <h3>Introducción</h3>
        <p>${wiki || "No hay descripción disponible en Wikipedia."}</p>
      `;
      modal.style.display = "block";
    });
  });
}

async function loadFeaturedCoins() {
  const featured = "bitcoin,ethereum,cardano,solana,polkadot";
  const coins = await fetchCoins(featured);
  renderCoins(coins);
}

searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim().toLowerCase();
  if (query) {
    const coins = await fetchCoins(query);
    renderCoins(coins);
  }
});

searchInput.addEventListener("keypress", e => {
  if (e.key === "Enter") searchBtn.click();
});

closeModal.addEventListener("click", () => modal.style.display = "none");
window.addEventListener("click", e => { if (e.target === modal) modal.style.display = "none"; });

loadFeaturedCoins();
