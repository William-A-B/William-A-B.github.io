import tkinter as tk
from ui.add_location import AddLocationPage
from ui.view_locations import ViewLocationsPage


class MainWindow(tk.Frame):
    BG_COLOUR = "#f4f6f8"
    HEADER_BG = "#2c3e50"
    HEADER_TEXT = "#ecf0f1"
    BUTTON_BG = "#34495e"
    BUTTON_HOVER = "#3d566e"

    def __init__(self, root, store):
        super().__init__(root, bg=self.BG_COLOUR)
        self.store = store
        self.pack(fill="both", expand=True)

        # ------------------------------
        # Header / Navigation bar
        # ------------------------------
        header = tk.Frame(self, bg=self.HEADER_BG, height=48)
        header.pack(fill="x")
        header.pack_propagate(False)

        title = tk.Label(
            header,
            text="Photo Location Manager",
            bg=self.HEADER_BG,
            fg=self.HEADER_TEXT,
            font=("Segoe UI", 14, "bold")
        )
        title.pack(side="left", padx=16)

        nav = tk.Frame(header, bg=self.HEADER_BG)
        nav.pack(side="right", padx=12)

        self.add_btn = self._nav_button(nav, "➕  Add Location", self.open_add)
        self.view_btn = self._nav_button(nav, "📍  View / Edit Locations", self.open_view)

        # ------------------------------
        # Content area
        # ------------------------------
        self.content = tk.Frame(self, bg=self.BG_COLOUR)
        self.content.pack(fill="both", expand=True, padx=16, pady=16)

        # Default view
        self.open_add()

    # ------------------------------
    # Helpers
    # ------------------------------
    def _nav_button(self, parent, text, command):
        btn = tk.Label(
            parent,
            text=text,
            bg=self.BUTTON_BG,
            fg=self.HEADER_TEXT,
            padx=12,
            pady=6,
            cursor="hand2",
            font=("Segoe UI", 10, "bold")
        )
        btn.pack(side="left", padx=6)

        btn.bind("<Button-1>", lambda e: command())
        btn.bind("<Enter>", lambda e: btn.config(bg=self.BUTTON_HOVER))
        btn.bind("<Leave>", lambda e: btn.config(bg=self.BUTTON_BG))

        return btn

    def clear(self):
        for widget in self.content.winfo_children():
            widget.destroy()

    # ------------------------------
    # Navigation actions
    # ------------------------------
    def open_add(self):
        self.clear()
        AddLocationPage(self.content, self.store)

    def open_view(self):
        self.clear()
        ViewLocationsPage(self.content, self.store)


# import tkinter as tk
# from ui.add_location import AddLocationPage
# from ui.view_locations import ViewLocationsPage


# class MainWindow(tk.Frame):
#     def __init__(self, root, store):
#         super().__init__(root)
#         self.store = store
#         self.pack(fill="both", expand=True)

#         nav = tk.Frame(self)
#         nav.pack(fill="x")

#         tk.Button(nav, text="Add Location", command=self.open_add).pack(side="left")
#         tk.Button(nav, text="View / Edit Locations", command=self.open_view).pack(side="left")

#         self.content = tk.Frame(self)
#         self.content.pack(fill="both", expand=True)

#     def clear(self):
#         for widget in self.content.winfo_children():
#             widget.destroy()

#     def open_add(self):
#         self.clear()
#         AddLocationPage(self.content, self.store)

#     def open_view(self):
#         self.clear()
#         ViewLocationsPage(self.content, self.store)
