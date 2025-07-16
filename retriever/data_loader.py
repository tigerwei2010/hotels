import pandas as pd
from .model import Hotel, usStateAbbrs

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