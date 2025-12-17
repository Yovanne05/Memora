from datetime import datetime
import pytz

def to_france_time(dt: datetime) -> datetime:
    if dt.tzinfo is None:
        dt = pytz.utc.localize(dt)
    
    france_tz = pytz.timezone("Europe/Paris")
    return dt.astimezone(france_tz)