import json
import os
import re
from pathlib import Path
import tkinter as tk
from tkinter import messagebox
from tkintermapview import TkinterMapView

# ------------------------------
# CONFIG
# ------------------------------

BASE_DIR = Path(__file__).resolve().parents[1]
DATA_FILE = BASE_DIR / "photography/photo-locations/data/photo-locations.json"
DEFAULT_CENTER = (54.5, -3.1)
DEFAULT_ZOOM = 6


# ------------------------------
# Helpers
# ------------------------------

def load_data():
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)


def slugify(text):
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def next_id(base, data):
    existing = [d["id"] for d in data if d["id"].startswith(base)]
    return f"{base}-{len(existing) + 1:03d}"


def value_or_none(value):
    return value.strip() if value.strip() else None


# ------------------------------
# Entry form
# ------------------------------

def open_entry_form(lat, lng):
    form = tk.Toplevel(root)
    form.title("Add Photo Location")

    fields = [
        ("Title", "title"),
        ("Type (landscape / wildlife / etc.)", "type"),
        ("Thumbnail URL", "thumbnail"),
        ("Full Image URL", "fullImageUrl"),
        ("Camera", "camera"),
        ("Lens", "lens"),
        ("Aperture", "aperture"),
        ("Shutter", "shutter"),
        ("ISO", "iso"),
        ("Date", "date"),
    ]

    entries = {}

    for i, (label, key) in enumerate(fields):
        tk.Label(form, text=label).grid(row=i, column=0, sticky="w", padx=5, pady=3)
        e = tk.Entry(form, width=45)
        e.grid(row=i, column=1, padx=5, pady=3)
        entries[key] = e

    def submit():
        data = load_data()

        title = value_or_none(entries["title"].get())
        photo_type = value_or_none(entries["type"].get())

        base_id = slugify(title or "photo")
        photo_id = next_id(base_id, data)

        entry = {
            "id": photo_id,
            "title": title,
            "type": photo_type,
            "coords": [round(lat, 5), round(lng, 5)],
            "thumbnail": value_or_none(entries["thumbnail"].get()),
            "fullImageUrl": value_or_none(entries["fullImageUrl"].get()),
            "metadata": {
                "camera": value_or_none(entries["camera"].get()),
                "lens": value_or_none(entries["lens"].get()),
                "aperture": value_or_none(entries["aperture"].get()),
                "shutter": value_or_none(entries["shutter"].get()),
                "iso": value_or_none(entries["iso"].get()),
                "date": value_or_none(entries["date"].get()),
            }
        }

        data.append(entry)
        save_data(data)

        map_widget.set_marker(lat, lng, text=title or "Untitled")
        messagebox.showinfo("Saved", f"Added: {photo_id}")
        form.destroy()

    tk.Button(form, text="Save", command=submit).grid(
        row=len(fields), column=0, columnspan=2, pady=10
    )


# ------------------------------
# Map callbacks
# ------------------------------

def on_right_click(coords):
    lat, lng = coords
    open_entry_form(lat, lng)


# ------------------------------
# App
# ------------------------------

root = tk.Tk()
root.title("Photography Location Editor")
root.geometry("900x600")

map_widget = TkinterMapView(root, corner_radius=0)
map_widget.pack(fill="both", expand=True)

map_widget.set_position(*DEFAULT_CENTER)
map_widget.set_zoom(DEFAULT_ZOOM)

map_widget.add_right_click_menu_command(
    label="Add photo location here",
    command=on_right_click,
    pass_coords=True
)

# Load existing markers
for item in load_data():
    lat, lng = item["coords"]
    map_widget.set_marker(lat, lng, text=item.get("title") or "Untitled")

root.mainloop()
