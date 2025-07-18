from pydantic import BaseModel
from typing import Optional, TypeAlias

class City(BaseModel):
    city_ascii: Optional[str] = None      
    state_id: Optional[str] = None        
    lat: Optional[float] = None 
    lng: Optional[float] = None
    population: Optional[int] = None
    name: Optional[str] = None          