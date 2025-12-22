import tkinter as tk
from tkinter import messagebox
from data.model import PhotoType
from tkintermapview import TkinterMapView


class EditLocationDialog(tk.Toplevel):
    def __init__(self, parent, store, location, on_save):
        super().__init__(parent)
        self.store = store
        self.location = location
        self.on_save = on_save

        self.title("Edit Location")
        self.geometry("960x780")
        self.resizable(False, False)
        self.grab_set()  # modal

        # container = tk.Frame(self, padx=14, pady=14)
        # container.pack(fill="both", expand=True)

        container = tk.Frame(self, padx=14, pady=14)
        container.pack(fill="both", expand=True)

        left = tk.Frame(container)
        left.pack(side="left", fill="y", padx=(0, 12))
        left.config(width=420)
        left.pack_propagate(False)

        right = tk.Frame(container)
        right.pack(side="right", fill="both", expand=True)

        self.entries = {}

        self.current_coords = list(location.coords)

        # ------------------------------
        # Helper for labelled fields
        # ------------------------------
        def labelled_entry(label, key, value):
            tk.Label(
                left,
                text=label,
                font=("Segoe UI", 9, "bold")
            ).pack(anchor="w")

            e = tk.Entry(left)
            e.pack(fill="x", pady=(0, 10))

            if value:
                e.insert(0, value)

            self.entries[key] = e

        # ------------------------------
        # Core fields
        # ------------------------------
        labelled_entry("ID (must be unique)", "id", location.id)
        labelled_entry("Title", "title", location.title)
        labelled_entry("Thumbnail URL", "thumbnail", location.thumbnail)
        labelled_entry("Full Image URL", "fullImageUrl", location.fullImageUrl)

        # ------------------------------
        # Coordinates (editable)
        # ------------------------------
        tk.Label(left, text="Latitude", font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.lat_entry = tk.Entry(left)
        self.lat_entry.pack(fill="x", pady=(0, 8))
        self.lat_entry.insert(0, str(self.current_coords[0]))

        tk.Label(left, text="Longitude", font=("Segoe UI", 9, "bold")).pack(anchor="w")
        self.lng_entry = tk.Entry(left)
        self.lng_entry.pack(fill="x", pady=(0, 10))
        self.lng_entry.insert(0, str(self.current_coords[1]))

        self.lat_entry.bind("<FocusOut>", self.on_coords_entry_change)
        self.lng_entry.bind("<FocusOut>", self.on_coords_entry_change)

        # ------------------------------
        # Type dropdown
        # ------------------------------
        tk.Label(
            left,
            text="Photo Type",
            font=("Segoe UI", 9, "bold")
        ).pack(anchor="w")

        self.type_var = tk.StringVar(value=location.type.value)
        tk.OptionMenu(
            left,
            self.type_var,
            *(t.value for t in PhotoType)
        ).pack(fill="x", pady=(0, 12))

        # ------------------------------
        # Metadata section
        # ------------------------------
        tk.Label(
            left,
            text="Metadata",
            font=("Segoe UI", 10, "bold")
        ).pack(anchor="w", pady=(10, 4))

        self.meta_entries = {}

        metadata_labels = {
            "camera": "Camera Body",
            "lens": "Lens",
            "aperture": "Aperture (e.g. f/5.6)",
            "shutter": "Shutter Speed (e.g. 1/250)",
            "iso": "ISO",
            "date": "Date Taken",
        }

        for key, label in metadata_labels.items():
            tk.Label(left, text=label).pack(anchor="w")
            e = tk.Entry(left)
            e.pack(fill="x", pady=(0, 8))

            if location.metadata.get(key):
                e.insert(0, location.metadata[key])

            self.meta_entries[key] = e

        # ------------------------------
        # Buttons
        # ------------------------------
        btns = tk.Frame(left)
        btns.pack(fill="x", pady=14)

        tk.Button(btns, text="Cancel", command=self.destroy).pack(side="right")
        tk.Button(btns, text="Save", command=self.save).pack(side="right", padx=8)

        self.map = TkinterMapView(right, corner_radius=0)
        self.map.pack(fill="both", expand=True)

        self.map.set_position(*self.current_coords)
        self.map.set_zoom(14)

        self.marker = self.map.set_marker(
            self.current_coords[0],
            self.current_coords[1],
            text=self.location.title or "Location"
        )

        # Click on map to move marker
        self.map.add_right_click_menu_command(
            "Move location here",
            self.on_map_click,
            pass_coords=True
            )

        
    def on_map_click(self, coords):
        lat, lng = coords
        self.current_coords = [round(lat, 6), round(lng, 6)]

        # Update marker
        self.marker.set_position(lat, lng)

        # Update text fields
        self.lat_entry.delete(0, tk.END)
        self.lat_entry.insert(0, str(self.current_coords[0]))

        self.lng_entry.delete(0, tk.END)
        self.lng_entry.insert(0, str(self.current_coords[1]))

    def on_coords_entry_change(self, event=None):
        try:
            lat = float(self.lat_entry.get())
            lng = float(self.lng_entry.get())
        except ValueError:
            return  # invalid input, ignore

        self.current_coords = [lat, lng]
        self.marker.set_position(lat, lng)
        self.map.set_position(lat, lng)

    # ------------------------------
    # Save logic
    # ------------------------------
    def save(self):
        new_id = self.entries["id"].get().strip()

        if not new_id:
            messagebox.showerror("Invalid ID", "ID cannot be empty")
            return

        # Check uniqueness
        all_locations = self.store.load()
        if any(
            loc.id == new_id and loc.id != self.location.id
            for loc in all_locations
        ):
            messagebox.showerror(
                "Duplicate ID",
                f"The ID '{new_id}' already exists."
            )
            return

        # Update fields
        self.location.id = new_id
        self.location.title = self.entries["title"].get() or None
        self.location.coords = self.current_coords
        self.location.thumbnail = self.entries["thumbnail"].get() or None
        self.location.fullImageUrl = self.entries["fullImageUrl"].get() or None
        self.location.type = PhotoType(self.type_var.get())

        for key, entry in self.meta_entries.items():
            self.location.metadata[key] = entry.get() or None

        # Persist changes
        for i, loc in enumerate(all_locations):
            if loc.id == self.location.id or loc is self.location:
                all_locations[i] = self.location
                break

        self.store.save(all_locations)

        self.on_save()
        messagebox.showinfo("Saved", "Location updated")
        self.destroy()
