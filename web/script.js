const API_BASE_URL = 'http://localhost:8000';

let debounceTimer;
const cityInput = document.getElementById('cityInput');
const suggestionsDiv = document.getElementById('suggestions');

// Autocomplete functionality
cityInput.addEventListener('input', function() {
    const query = this.value.trim();
    
    clearTimeout(debounceTimer);
    
    if (query.length < 1) {
        hideSuggestions();
        return;
    }
    
    debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
    }, 50);
});

// Hide suggestions when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.autocomplete-container')) {
        hideSuggestions();
    }
});

async function fetchSuggestions(prefix) {
    try {
        const response = await fetch(`${API_BASE_URL}/auto_complete?prefix=${encodeURIComponent(prefix)}`);
        const suggestions = await response.json();
        
        if (Array.isArray(suggestions) && suggestions.length > 0) {
            showSuggestions(suggestions);
        } else {
            hideSuggestions();
        }
    } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        hideSuggestions();
    }
}

function showSuggestions(suggestions) {
    suggestionsDiv.innerHTML = suggestions.map(city => 
        `<div class="suggestion-item" data-city="${city}">${city}</div>`
    ).join('');
    
    // Add click handlers for suggestions
    suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            cityInput.value = this.dataset.city;
            hideSuggestions();
            // Trigger search automatically
            document.getElementById('searchForm').dispatchEvent(new Event('submit'));
        });
    });
    
    suggestionsDiv.classList.remove('hidden');
}

function hideSuggestions() {
    suggestionsDiv.classList.add('hidden');
}

document.getElementById('searchForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const cityName = document.getElementById('cityInput').value.trim();
    if (!cityName) return;
    
    showLoading();
    hideError();
    hideResults();
    
    try {
        const response = await fetch(`${API_BASE_URL}/hotels_nearby?city_name=${encodeURIComponent(cityName)}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.error) {
            showError(data.error);
        } else {
            showResults(data, cityName);
        }
    } catch (error) {
        hideLoading();
        showError('Failed to fetch hotels. Make sure the API server is running.');
    }
});

function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading').classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    document.getElementById('error').classList.add('hidden');
}

function showResults(hotels, cityName) {
    const resultsDiv = document.getElementById('results');
    const hotelListDiv = document.getElementById('hotelList');
    
    resultsDiv.querySelector('h2').textContent = `Hotels in ${cityName}`;
    
    if (Array.isArray(hotels) && hotels.length > 0) {
        hotelListDiv.innerHTML = hotels.map(hotel => `
            <div class="hotel-card">
                <h3>${hotel.hotelName}</h3>
                <p class="rating">Rating: ${hotel.stars || 'N/A'}</p>
                <p class="address">${hotel.address || 'Address not available'}</p>
                <p class="description">${hotel.description || 'No description available'}</p>
                ${hotel.phoneNumber ? `<p class="phone">Phone: ${hotel.phoneNumber}</p>` : ''}
                ${hotel.hotelUrl ? `<a href="${hotel.hotelUrl}" target="_blank" class="website-link">Visit Website</a>` : ''}
            </div>
        `).join('');
    } else {
        hotelListDiv.innerHTML = '<p>No hotels found for this city.</p>';
    }
    
    resultsDiv.classList.remove('hidden');
}

function hideResults() {
    document.getElementById('results').classList.add('hidden');
}