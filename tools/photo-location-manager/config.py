from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

DATA_FILE = (
    BASE_DIR
    / "photography"
    / "photo-locations"
    / "data"
    / "photo-locations.json"
)

DEFAULT_CENTER = (54.5, -3.1)
DEFAULT_ZOOM = 6