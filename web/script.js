const API_BASE_URL = 'http://localhost:8000';

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