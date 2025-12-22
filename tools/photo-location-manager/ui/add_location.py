import tkinter as tk
from tkintermapview import TkinterMapView
from data.model import PhotoLocation
from utils import generate_id
from config import DEFAULT_CENTER, DEFAULT_ZOOM
from tkinter import messagebox
from data.model import PhotoLocation, PhotoType


class AddLocationPage(tk.Frame):
    def __init__(self, parent, store):
        super().__init__(parent)
        self.store = store
        self.pack(fill="both", expand=True)

        header = tk.Label(
            self,
            text="Add Location (Right-click on map)",
            font=("Segoe UI", 16, "bold")
        )
        header.pack(anchor="w", padx=8, pady=(0, 8))

        self.map = TkinterMapView(self, corner_radius=0)
        self.map.pack(fill="both", expand=True)

        self.map.set_position(*DEFAULT_CENTER)
        self.map.set_zoom(DEFAULT_ZOOM)

        self.map.add_right_click_menu_command(
            "Add location here",
            self.open_add_dialog,
            pass_coords=True
        )

    def open_add_dialog(self, coords):
        AddLocationDialog(
            parent=self,
            store=self.store,
            coords=coords,
            on_save=self.refresh_marker_preview
        )

    def refresh_marker_preview(self):
        # Optional: refresh markers or give visual feedback
        pass



class AddLocationDialog(tk.Toplevel):
    def __init__(self, parent, store, coords, on_save):
        super().__init__(parent)
        self.store = store
        self.coords = coords
        self.on_save = on_save

        self.title("Add Location")
        self.geometry("520x780")
        self.resizable(False, False)
        self.grab_set()  # modal

        container = tk.Frame(self, padx=14, pady=14)
        container.pack(fill="both", expand=True)

        self.entries = {}

        # ------------------------------
        # Helper for labelled fields
        # ------------------------------
        def labelled_entry(label, key, value=None, readonly=False):
            tk.Label(
                container,
                text=label,
                font=("Segoe UI", 9, "bold")
            ).pack(anchor="w")

            e = tk.Entry(container)
            e.pack(fill="x", pady=(0, 10))

            if value is not None:
                e.insert(0, value)

            if readonly:
                e.config(state="readonly")

            self.entries[key] = e

        # ------------------------------
        # Core fields
        # ------------------------------
        labelled_entry("ID (must be unique)", "id")
        labelled_entry("Title", "title")

        # ------------------------------
        # Coordinates (read-only)
        # ------------------------------
        lat, lng = coords
        labelled_entry("Latitude", "lat", f"{lat:.5f}", readonly=True)
        labelled_entry("Longitude", "lng", f"{lng:.5f}", readonly=True)

        labelled_entry("Thumbnail URL", "thumbnail")
        labelled_entry("Full Image URL", "fullImageUrl")

        # ------------------------------
        # Type dropdown
        # ------------------------------
        tk.Label(
            container,
            text="Photo Type",
            font=("Segoe UI", 9, "bold")
        ).pack(anchor="w")

        self.type_var = tk.StringVar(value=PhotoType.DEFAULT.value)
        tk.OptionMenu(
            container,
            self.type_var,
            *(t.value for t in PhotoType)
        ).pack(fill="x", pady=(0, 12))

        # ------------------------------
        # Metadata
        # ------------------------------
        tk.Label(
            container,
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
            tk.Label(container, text=label).pack(anchor="w")
            e = tk.Entry(container)
            e.pack(fill="x", pady=(0, 8))
            self.meta_entries[key] = e

        # ------------------------------
        # Buttons
        # ------------------------------
        btns = tk.Frame(container)
        btns.pack(fill="x", pady=14)

        tk.Button(btns, text="Cancel", command=self.destroy).pack(side="right")
        tk.Button(btns, text="Add", command=self.save).pack(side="right", padx=8)

    # ------------------------------
    # Save logic
    # ------------------------------
    def save(self):
        new_id = self.entries["id"].get().strip()

        if not new_id:
            messagebox.showerror("Invalid ID", "ID cannot be empty")
            return

        locations = self.store.load()

        if any(loc.id == new_id for loc in locations):
            messagebox.showerror(
                "Duplicate ID",
                f"The ID '{new_id}' already exists."
            )
            return

        metadata = {
            key: entry.get() or None
            for key, entry in self.meta_entries.items()
        }

        new_location = PhotoLocation(
            id=new_id,
            title=self.entries["title"].get() or None,
            type=PhotoType(self.type_var.get()),
            coords=[float(self.coords[0]), float(self.coords[1])],
            thumbnail=self.entries["thumbnail"].get() or None,
            fullImageUrl=self.entries["fullImageUrl"].get() or None,
            metadata=metadata
        )

        locations.append(new_location)
        self.store.save(locations)

        self.on_save()
        messagebox.showinfo("Added", "New location added")
        self.destroy()
