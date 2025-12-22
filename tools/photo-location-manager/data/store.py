import json
from pathlib import Path
from typing import List
from .model import PhotoLocation

class PhotoLocationStore:
    def __init__(self, json_path: Path):
        self.json_path = json_path

    def load(self) -> List[PhotoLocation]:
        """Load photo locations from the JSON file."""
        if not self.json_path.exists():
            return []
        
        with open(self.json_path, "r", encoding="utf-8") as f:
            raw_data = json.load(f)

        photo_locations = []
        for item in raw_data:
            photo_location_data = PhotoLocation.from_dict(item)
            photo_locations.append(photo_location_data)
                
        return photo_locations

    def save(self, photo_locations: List[PhotoLocation]):
        """Save photo locations to the JSON file."""
        raw_data = []
        for photo in photo_locations:
            raw_data.append(photo.to_dict())
        with open(self.json_path, "w", encoding="utf-8") as f:
            json.dump(raw_data, f, indent=4)

    def delete(self, photo_location_id_to_remove: str):
        """Delete a photo location by its ID."""
        photo_locations = self.load()

        for photo_location in photo_locations:
            if photo_location.id == photo_location_id_to_remove:
                photo_locations.remove(photo_location)
                self.save(photo_locations)