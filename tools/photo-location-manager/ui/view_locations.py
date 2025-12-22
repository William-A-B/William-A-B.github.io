import tkinter as tk
from tkinter import messagebox
from ui.edit_location import EditLocationDialog



class ViewLocationsPage(tk.Frame):
    BG_COLOUR = "#f4f6f8"
    PANEL_BG = "#ffffff"
    BORDER_COLOUR = "#d0d7de"
    BUTTON_BG = "#34495e"
    BUTTON_HOVER = "#3d566e"
    DANGER_BG = "#c0392b"
    DANGER_HOVER = "#e74c3c"

    def __init__(self, parent, store):
        super().__init__(parent, bg=self.BG_COLOUR)
        self.store = store
        self.pack(fill="both", expand=True)

        # ------------------------------
        # Header
        # ------------------------------
        header = tk.Label(
            self,
            text="View / Edit Locations",
            bg=self.BG_COLOUR,
            font=("Segoe UI", 16, "bold")
        )
        header.pack(anchor="w", padx=8, pady=(0, 8))

        # ------------------------------
        # List container
        # ------------------------------
        container = tk.Frame(
            self,
            bg=self.PANEL_BG,
            highlightbackground=self.BORDER_COLOUR,
            highlightthickness=1
        )
        container.pack(fill="both", expand=True)

        self.listbox = tk.Listbox(
            container,
            font=("Segoe UI", 10),
            activestyle="none",
            selectbackground="#cce4ff",
            bd=0
        )
        self.listbox.pack(fill="both", expand=True, padx=4, pady=4)

        self.listbox.bind("<Double-Button-1>", lambda e: self.edit())

        self.refresh()

        # ------------------------------
        # Action buttons
        # ------------------------------
        btns = tk.Frame(self, bg=self.BG_COLOUR)
        btns.pack(fill="x", pady=8)

        self._action_button(btns, "✏️  Edit", self.edit)
        self._action_button(btns, "🗑  Delete", self.delete, danger=True)

    # ------------------------------
    # Helpers
    # ------------------------------
    def _action_button(self, parent, text, command, danger=False):
        bg = self.DANGER_BG if danger else self.BUTTON_BG
        hover = self.DANGER_HOVER if danger else self.BUTTON_HOVER

        btn = tk.Label(
            parent,
            text=text,
            bg=bg,
            fg="white",
            padx=12,
            pady=6,
            cursor="hand2",
            font=("Segoe UI", 10, "bold")
        )
        btn.pack(side="left", padx=6)

        btn.bind("<Button-1>", lambda e: command())
        btn.bind("<Enter>", lambda e: btn.config(bg=hover))
        btn.bind("<Leave>", lambda e: btn.config(bg=bg))

        return btn

    # ------------------------------
    # Data handling
    # ------------------------------
    def refresh(self):
        self.listbox.delete(0, tk.END)
        for loc in self.store.load():
            title = loc.title or "Untitled"
            self.listbox.insert(tk.END, f"{loc.id}   —   {title}")

    def delete(self):
        sel = self.listbox.curselection()
        if not sel:
            return

        index = sel[0]
        locations = self.store.load()
        loc = locations[index]

        confirm = messagebox.askyesno(
            "Confirm delete",
            f"Delete location:\n\n{loc.id}\n{loc.title or 'Untitled'}?"
        )

        if not confirm:
            return

        self.store.delete(loc.id)
        self.refresh()

    def edit(self):
        sel = self.listbox.curselection()
        if not sel:
            return

        index = sel[0]
        locations = self.store.load()
        loc = locations[index]

        EditLocationDialog(
            parent=self,
            store=self.store,
            location=loc,
            on_save=self.refresh
        )






# import tkinter as tk


# class ViewLocationsPage(tk.Frame):
#     def __init__(self, parent, store):
#         super().__init__(parent)
#         self.store = store
#         self.pack(fill="both", expand=True)

#         self.listbox = tk.Listbox(self)
#         self.listbox.pack(fill="both", expand=True)

#         self.refresh()

#         btns = tk.Frame(self)
#         btns.pack(fill="x")

#         tk.Button(btns, text="Delete", command=self.delete).pack(side="left")

#     def refresh(self):
#         self.listbox.delete(0, tk.END)
#         for loc in self.store.load():
#             self.listbox.insert(tk.END, f"{loc.id} — {loc.title}")

#     def delete(self):
#         sel = self.listbox.curselection()
#         if not sel:
#             return

#         index = sel[0]
#         loc = self.store.load()[index]
#         self.store.delete(loc.id)
#         self.refresh()