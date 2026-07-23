# 📚 BookRunners

A cozy, offline, manual reading timer for your bookshelf — track time spent reading each book, jot notes, rate what you finish, and watch your library grow.

## Download (no install needed, just the app)

**[⬇ Download BookRunnersSetup.exe from the latest Release](../../releases/latest)**

Run the installer, click through, done — no Python, no dependencies, nothing else to install. It installs to your user folder (no admin rights needed) and adds a Start Menu / optional Desktop shortcut.

## Features

- Manual play/pause reading timer per book, with autosave
- A personal bookshelf: add books, sort by title/author/rating/last read, filter by genre
- Author, genre tags, notes, and a 1–5 star rating per book
- Mark books as Finished and see your stats in the Library Log tab
- Custom cover image and background per book
- Five cozy/neutral color themes (Cozy Cottage, Blush Library, Sage & Linen, Lavender Dusk, Warm Oak) plus full custom colors and fonts
- Optional system tray icon, launch-at-startup, export/import individual books
- Everything is stored locally in a plain JSON file next to the app — no account, no internet required

## Building from source

The full source is just one file, [`bookrunners.py`](bookrunners.py). To run it directly:

```bash
pip install pillow pystray
python bookrunners.py
```

`pillow` and `pystray` are optional — the app runs without them, just without custom covers/backgrounds and the tray icon.

To build your own installer, see [`installer.iss`](installer.iss) (requires [Inno Setup](https://jrsoftware.org/isinfo.php)) after building the exe with PyInstaller:

```bash
pyinstaller --noconfirm --onefile --windowed --name BookRunners --icon icon.ico --add-data "icon.ico;." bookrunners.py
```

## License

MIT — see [LICENSE](LICENSE).
