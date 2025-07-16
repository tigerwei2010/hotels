from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import HOTELS_PQ_FILE
from .data_loader import DataLoader
from operator import attrgetter


dataLoader = DataLoader()
hotels = dataLoader.load(HOTELS_PQ_FILE, country="United States")

# build city index
cityIndex = {}
for hotelId, hotel in hotels.items():
    cityName = hotel.cityName.lower()
    if cityName not in cityIndex:
         cityIndex[cityName] = [hotelId]
    else:
        cityIndex[cityName].append(hotelId)


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
    retrieved_hotels = [hotels[hotel_id] for hotel_id in hotel_ids]
    retrieved_hotels.sort(key=attrgetter('starScore'), reverse=True)

    trimmed_hotels = retrieved_hotels[:5]    
    
    return trimmed_hotels