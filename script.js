// Disable zooming and inspect
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
    document.body.style.zoom = 1.0;
});

document.addEventListener('wheel', function(e) {
    if (e.ctrlKey) {
        e.preventDefault();
        showNotification("Zooming is disabled on this site");
    }
}, { passive: false });

document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    showNotification("Inspect element is disabled on this site");
});

document.onkeydown = function(e) {
    if (e.keyCode == 123 || // F12
        (e.ctrlKey && e.shiftKey && e.keyCode == 73) || // Ctrl+Shift+I
        (e.ctrlKey && e.shiftKey && e.keyCode == 74) || // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode == 85)) { // Ctrl+U
        e.preventDefault();
        showNotification("Developer tools are disabled on this site");
    }
};

// Legal navigation
document.querySelectorAll('.legal-btn').forEach(button => {
    button.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.legal-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Hide all sections
        document.querySelectorAll('.legal-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const target = this.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
    });
});

// Print functionality
function printCard() {
    window.print();
}

// Save card as image
function saveCard() {
    html2canvas(document.getElementById('pokemonCard'), {
        scale: 2,
        backgroundColor: null,
        logging: false,
        useCORS: true
    }).then(canvas => {
        // Create download link
        const link = document.createElement('a');
        const pokemonName = document.querySelector('.card-title').textContent.toLowerCase();
        link.download = `${pokemonName}-pokemon-card.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        
        // Show notification
        showNotification('Card saved successfully!');
    });
}

// Show notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Fetch Pokémon data from PokeAPI
async function fetchPokemonData(nameOrId) {
    try {
        document.getElementById('loading').classList.add('show');
        
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${nameOrId}`);
        if (!response.ok) {
            throw new Error('Pokémon not found');
        }
        
        return await response.json();
    } catch (error) {
        showNotification('Error: ' + error.message);
        return null;
    } finally {
        document.getElementById('loading').classList.remove('show');
    }
}

// Update card with Pokémon data
async function updateCard(pokemon) {
    const data = await fetchPokemonData(pokemon);
    if (!data) return;
    
    // Basic info
    document.querySelector('.card-title').textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);
    document.querySelector('.hp').textContent = `HP ${data.stats[0].base_stat}`;
    
    // Image
    const officialArtwork = data.sprites.other['official-artwork']?.front_default;
    const dreamWorld = data.sprites.other?.dream_world?.front_default;
    const imageUrl = officialArtwork || dreamWorld || data.sprites.front_default;
    document.getElementById('pokemon-img').src = imageUrl;
    
    // Stats
    document.getElementById('attack-value').textContent = data.stats[1].base_stat;
    document.getElementById('defense-value').textContent = data.stats[2].base_stat;
    document.getElementById('speed-value').textContent = data.stats[5].base_stat;
    document.getElementById('special-value').textContent = data.stats[3].base_stat;
    
    // Abilities
    const abilitiesContainer = document.getElementById('abilities-container');
    abilitiesContainer.innerHTML = '';
    data.abilities.slice(0, 3).forEach(ability => {
        const abilityEl = document.createElement('div');
        abilityEl.className = 'ability';
        abilityEl.textContent = ability.ability.name.replace('-', ' ');
        abilitiesContainer.appendChild(abilityEl);
    });
    
    // Moves
    const movesContainer = document.getElementById('moves-container');
    movesContainer.innerHTML = '';
    data.moves.slice(0, 6).forEach(move => {
        const moveEl = document.createElement('div');
        moveEl.className = 'move';
        moveEl.textContent = move.move.name.replace('-', ' ');
        movesContainer.appendChild(moveEl);
    });
    
    // Show notification
    showNotification(`${data.name} card loaded!`);
}

// Search functionality
const searchInput = document.getElementById('pokemon-search');
const searchBtn = document.getElementById('search-btn');
const searchSuggestions = document.getElementById('search-suggestions');

// Search button click
searchBtn.addEventListener('click', async function() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (!searchTerm) return;
    
    // Clear suggestions
    searchSuggestions.classList.remove('show');
    
    // Fetch and update card
    await updateCard(searchTerm);
});

// Close suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!searchSuggestions.contains(e.target) && e.target !== searchInput) {
        searchSuggestions.classList.remove('show');
    }
});

// Randomize card data
async function randomizeCard() {
    const randomId = Math.floor(Math.random() * 898) + 1;
    await updateCard(randomId);
}

// Initial random card on load
document.addEventListener('DOMContentLoaded', randomizeCard);