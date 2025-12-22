import tkinter as tk
from data.store import PhotoLocationStore
from config import DATA_FILE
from ui.main_window import MainWindow


class PhotoLocationApp:
    def __init__(self):
        self.root = tk.Tk()
        self.root.title("Photo Location Manager")
        self.root.geometry("960x780")

        self.store = PhotoLocationStore(DATA_FILE)

        MainWindow(self.root, self.store)

    def run(self):
        self.root.mainloop()
