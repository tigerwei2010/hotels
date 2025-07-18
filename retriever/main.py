from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import HOTELS_PQ_FILE, CITIES_CSV_FILE
from .data_loader import DataLoader
from operator import attrgetter
from collections import defaultdict
import h3



dataLoader = DataLoader()
us_hotel_dict = dataLoader.load(HOTELS_PQ_FILE, country="United States")

# build city index
cityIndex = {}
for hotelId, hotel in us_hotel_dict.items():
    cityName = hotel.cityName.lower()
    if cityName not in cityIndex:
         cityIndex[cityName] = [hotelId]
    else:
        cityIndex[cityName].append(hotelId)


def get_latlon(hotel):
    latlong = hotel.latlong
    if not latlong:
        return (None, None)
    lat, lon = latlong.split('|')
    return float(lat), float(lon)


# build geo index
geoIndex = {}  # cell_id to a list of hotel_id 
for hotelId, hotel in us_hotel_dict.items():
    latlong = hotel.latlong
    if not latlong:
        continue
    lat, lon = get_latlon(hotel)
    resolution = 4
    cell_id = h3.latlng_to_cell(lat, lon, resolution) 
    neighborhood_cell_ids = h3.grid_disk(cell_id)
    for neighborhood_cell_id in neighborhood_cell_ids:
        if neighborhood_cell_id not in geoIndex:
            geoIndex[neighborhood_cell_id] = [hotelId]
        else:
            geoIndex[neighborhood_cell_id].append(hotelId)


# load us cities
us_cities_dict = dataLoader.load_cites(CITIES_CSV_FILE)

# build prefix index for auto complete
cityNameIndex = defaultdict(list)
us_cities = list(us_cities_dict.values())
us_cities.sort(key=attrgetter('population'), reverse=True)
for city in us_cities:
    name = city.name.lower()
    for length in range(1, len(name)):
        prefix = name[:length]
        if len(cityNameIndex[prefix]) <= 10:
            cityNameIndex[prefix].append(city.name)



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def health_check():
    return "pong"


@app.get("/hotels_by_city_name")
def get_hotels_by_city_name(city_name: str):
    city_name_lower = city_name.lower()
    print(f'city_name = {city_name}')
    print(f'city_name_lower = {city_name_lower}')
    
    if city_name_lower not in cityIndex:
        return {"error": "City not found", "city_name": city_name}
    
    hotel_ids = cityIndex[city_name_lower]
    retrieved_hotels = [us_hotel_dict[hotel_id] for hotel_id in hotel_ids]
    retrieved_hotels.sort(key=attrgetter('starScore'), reverse=True)

    trimmed_hotels = retrieved_hotels[:5]    
    
    return trimmed_hotels

@app.get("/hotels_by_coordinate")
def get_hotels_by_coordinate(lat: float, lon: float):
    resolution = 4
    cell_id = h3.latlng_to_cell(lat, lon, resolution)
    hotel_ids = geoIndex.get(cell_id, [])
    
    retrieved_hotels = [us_hotel_dict[hotel_id] for hotel_id in hotel_ids]
    filtered_hotels = []
    latlon1 = (lat, lon)
    for hotel in retrieved_hotels:
        latlon2 = get_latlon(hotel)
        distance = h3.great_circle_distance(latlon1, latlon2, unit='km')
        if distance <= 25.0:
            hotel.score = distance
            filtered_hotels.append(hotel)

    filtered_hotels.sort(key=attrgetter('score'))
    trimmed_hotels = filtered_hotels[:5]    
    
    return trimmed_hotels

@app.get("/hotels_nearby")
def get_hotels_nearby(city_name: str):
    city_name_lower = city_name.lower()
    city = us_cities_dict.get(city_name_lower, None)
    hotels = get_hotels_by_coordinate(city.lat, city.lng)

    return hotels

@app.get("/auto_complete")
def get_city_names(prefix: str):
    prefix_lower = prefix.lower()
    city_names = cityNameIndex.get(prefix_lower, []) 
    return city_names