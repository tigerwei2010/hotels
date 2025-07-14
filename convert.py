import codecs
import pandas as pd
from retriever.config import HOTELS_CSV_FILE, HOTELS_PQ_FILE


# insert a HotelId column to the hotels.csv and convert it to parquet format
with codecs.open(HOTELS_CSV_FILE, 'r', encoding='ISO-8859-1') as f:
    df = pd.read_csv(f)
    total_rows = len(df)

    # Declare a list that is to be converted into the new column
    adIds = [str(i) for i in range(total_rows)]

    # Insert a new column 'adId'
    df.insert(0, 'adId', adIds)

    # rename the columns
    column_names_mapping = {
        ' countyName': 'countyName',
        ' cityCode': 'cityCode',
        ' cityName': 'cityName',
        ' HotelName': 'hotelName',
        ' HotelCode': 'hotelId', 
        ' HotelRating': 'stars', 
        ' Address': 'address', 
        ' Attractions': 'attractions', 
        ' Description': 'description', 
        ' HotelFacilities': 'hotelFacilities',
        ' Map': 'latlong', 
        ' PhoneNumber': 'phoneNumber',
        ' HotelWebsiteUrl': 'hotelUrl',
    }
    print("Before renaming:", df.columns)
    df.rename(columns=column_names_mapping, inplace=True)
    print("After renaming:", df.columns)

    # convert to parquet file
    df.to_parquet(HOTELS_PQ_FILE, compression=None)