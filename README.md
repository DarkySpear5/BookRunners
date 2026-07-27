# 📚 Capharnaum

A cozy, offline reading tracker for your personal library — track time spent reading each book, tag genres, rate and review, and keep a warm little "Reading Nook" for whatever you're in the middle of.

## Download

**[⬇ Download the latest installer from Releases](../../releases/latest)**

Run the installer, click through, done — no admin rights needed. Installs to your user folder and adds a Start Menu / optional Desktop shortcut. The app checks for updates on launch and can update itself in place.

## Features

- Manual play/pause reading timer per book, with autosave every few seconds and concurrent timers (switching books doesn't pause the one you left)
- A personal bookshelf: add books, sort by name/author/last read/rating/genre, filter by genre
- Four-state tracking — Reading, Finished, On Hold, Dropped — each with its own snapshot of time and date
- Genre tags (multi-select from 22 book genres), author, notes, and a 1–5 star rating per book
- Manual "Add Reading Time" for reading done outside the app, with an optional note
- Duplicate, export (`.brprofile`), and import individual books
- Custom cover art and a per-book background (solid color or image) behind the Reading Nook
- Nine built-in themes (Cozy Cottage, Blush Library, Sage & Linen, Lavender Dusk, Warm Oak, Midnight Library, Autumn Pages, Mint Marginalia, Slate Study) plus full custom colors
- 10 languages, switchable anytime, no restart needed
- Optional system tray icon, launch-at-startup, daily rolling backups of your tracked time
- Everything is stored locally — no account, no internet required except to check for app updates

## Editions

- **`v2` branch (this one)** — the current, actively developed Electron edition. Modern UI, auto-updates, all the features above.
- **`master` branch** — the original lightweight Python/Tkinter edition (v1.1), frozen but still available for anyone who'd rather not have the Electron/Chromium footprint.

## Building from source (v2)

```bash
npm install
npm run dev       # run in development
npm run typecheck
npm run package    # build a Windows installer into release/
```

## License

MIT — see [LICENSE](LICENSE).
