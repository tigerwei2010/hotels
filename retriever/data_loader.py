import pandas as pd
from .model import City, Hotel, usStateAbbrs


StarScoreMapping = {
    'OneStar': 1,
    'TwoStar': 2,
    'ThreeStar': 3,
    'FourStar': 4,
    'FiveStar': 5,
}

class DataLoader:
    def __init__(self) -> None:
        pass

    def load(self, parquet_file: str, country=None) -> dict[int, Hotel]:
        hotels = {}
        df = pd.read_parquet(parquet_file, engine="fastparquet")
        for _, row in df.iterrows():
            d = row.to_dict()
            hotel = Hotel.model_validate(d)
            if not hotel.description:
                continue

            if country and hotel.countyName != country:
                continue

            cityAndStateName = hotel.cityName
            cityAndStateName = ' '.join(cityAndStateName.split())   # remove extra spaces
            names = cityAndStateName.split(', ')
            stateName = names[-1]
            names[-1] = usStateAbbrs.get(stateName.lower(), stateName)
            cityAndStateName = ', '.join(names)

            hotel.cityName = cityAndStateName
            hotel.starScore = StarScoreMapping.get(hotel.stars, 1)
            hotels[hotel.hotelId] = hotel
            
        return hotels
    
    def load_cites(self, csv_file) -> dict[str, City]:
        cities = {}
        df = pd.read_csv(csv_file)
        for _, row in df.iterrows():
            d = row.to_dict()
            city = City.model_validate(d)
            if not city.city_ascii or not city.state_id:
                continue
            if not city.lat or not city.lng:
                continue
            # now we have a good city data
            city_name = city.city_ascii + ', ' + city.state_id
            city_name_lower = city_name.lower()
            cities[city_name_lower] = city
            
        return cities