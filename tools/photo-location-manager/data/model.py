from dataclasses import dataclass
from typing import List, Optional, Dict, Any
from enum import Enum

class PhotoType(str, Enum):
    LANDSCAPE = "landscape"
    NATURE = "nature"
    WILDLIFE = "wildlife"
    DEFAULT = "default"

@dataclass
class PhotoLocation:
    id: str
    title: str
    type: PhotoType
    coords: List[float]  # [latitude, longitude]
    thumbnail: Optional[str] = None
    fullImageUrl: Optional[str] = None
    metadata: Dict[str, Optional[str]] = None

    def to_dict(self) -> Dict[str, Any]:#
        """
        Convert this PhotoLocation object into a plain Python dictionary.

        This dictionary:
        - Contains only JSON-serialisable types
        - Matches the exact schema expected by the website
        - Converts enums (PhotoType) into strings

        This method is used right before saving data to the JSON file.
        """
        if self.type is None:
            self.type = PhotoType.DEFAULT

        return {
            "id": self.id,
            "title": self.title,
            "type": self.type.value,
            "coords": self.coords,
            "thumbnail": self.thumbnail,
            "fullImageUrl": self.fullImageUrl,
            "metadata": self.metadata,
        }
    
    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "PhotoLocation":
        """
        Create a PhotoLocation object from a dictionary loaded from JSON.

        This method:
        - Validates and converts raw JSON data
        - Converts strings back into enums
        - Applies defaults where fields are missing

        This is used immediately after loading the JSON file.
        """
        return PhotoLocation(
            id=data["id"],
            title=data.get("title"),
            type=PhotoType(data.get("type", "default")),
            coords=data["coords"],
            thumbnail=data.get("thumbnail"),
            fullImageUrl=data.get("fullImageUrl"),
            metadata=data.get("metadata", {}),
        )