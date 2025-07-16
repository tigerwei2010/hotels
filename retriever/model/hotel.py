from pydantic import BaseModel
from typing import Optional, TypeAlias

AdId: TypeAlias = str

class Hotel(BaseModel):
    adId: AdId       # Unique identifier for the ad
    hotelId: int    # Unique identifier for the hotel
    hotelName: str  # The name of the hotel
    countyName: Optional[str] = None      # Country Name where this hotel belongs
    cityName: Optional[str] = None        # The city where the hotel is located
    stars: Optional[str] = None           # The star rating of the hotel, ex, FourStar
    starScore: Optional[int] = 1          # The star value of the star rating. OneStar = 1, FourStar = 4
    address: Optional[str] = None         # The address of the hotel
    description: Optional[str] = None     # The detailed description of the hotel
    hotelFacilities: Optional[str] = None # The facilities available in the hotel
    attractions: Optional[str] = None     # The attractions nearby to the hotel
    latlong:  Optional[str] = None        # The GPS location of the hotel available in the hotel in latitude and longitude
    phoneNumber: Optional[str] = None     # The phone number of the hotel
    hotelUrl: Optional[str] = None        # The web booking URL of the hotel
    imageUrl: Optional[str] = None        # URL of the ad image
    score: Optional[float] = None         # similarity score for the user and query