const API_BASE_URL = 'http://localhost:8000';

let debounceTimer;
let currentPage = 1;
let currentCityName = '';
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
        currentCityName = cityName;
        currentPage = 1;
        await searchHotels(cityName, currentPage);
    } catch (error) {
        hideLoading();
        showError('Failed to fetch hotels. Make sure the API server is running.');
    }
});

async function searchHotels(cityName, page = 1) {
    try {
        const response = await fetch(`${API_BASE_URL}/hotels_nearby?city_name=${encodeURIComponent(cityName)}&page=${page}`);
        const data = await response.json();
        
        hideLoading();
        
        if (data.error) {
            showError(data.error);
        } else {
            showResults(data, cityName, page);
        }
    } catch (error) {
        hideLoading();
        showError('Failed to fetch hotels. Make sure the API server is running.');
    }
}

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

function showResults(hotels, cityName, page) {
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
        
        updatePagination(page, hotels.length);
    } else {
        hotelListDiv.innerHTML = '<p>No hotels found for this city.</p>';
        document.getElementById('pagination').innerHTML = '';
    }
    
    resultsDiv.classList.remove('hidden');
}

function updatePagination(currentPage, resultsCount) {
    let paginationDiv = document.getElementById('pagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'pagination';
        paginationDiv.className = 'pagination';
        document.getElementById('results').appendChild(paginationDiv);
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="page-btn prev-btn" onclick="goToPage(${currentPage - 1})">&laquo; Previous</button>`;
    }
    
    // Page numbers (show current page and some around it)
    const startPage = Math.max(1, currentPage - 2);
    const endPage = currentPage + 2;
    
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="page-btn current-page">${i}</button>`;
        } else {
            paginationHTML += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }
    
    // Next button (only show if we got results, assuming there might be more)
    if (resultsCount > 0) {
        paginationHTML += `<button class="page-btn next-btn" onclick="goToPage(${currentPage + 1})">Next &raquo;</button>`;
    }
    
    paginationDiv.innerHTML = paginationHTML;
}

async function goToPage(page) {
    if (page < 1 || !currentCityName) return;
    
    currentPage = page;
    showLoading();
    hideError();
    
    await searchHotels(currentCityName, page);
    hideLoading();
    
    // Scroll to top with faster smooth animation
    smoothScrollToTop();
}

function smoothScrollToTop() {
    const start = window.pageYOffset;
    const startTime = performance.now();
    const duration = 300; // 300ms instead of default ~800ms (2x+ faster)
    
    function scroll(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        window.scrollTo(0, start * (1 - easeOutQuart));
        
        if (progress < 1) {
            requestAnimationFrame(scroll);
        }
    }
    
    requestAnimationFrame(scroll);
}

function hideResults() {
    document.getElementById('results').classList.add('hidden');
}