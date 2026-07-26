# Changelog

## v2.0.0 — Electron rewrite

A full rewrite from Python/Tkinter to Electron/TypeScript/React, on the new `v2` branch. `master` (v1.1) stays available as the lightweight edition.

### Added
- **On Hold** and **Dropped** statuses alongside Reading/Finished, each with its own tracked-time and date snapshot
- **Duplicate** a book (right-click) — clones time, cover, background, genres, notes, and rating
- **Unmark Finished** — clears Finished status and its snapshot without touching tracked time
- **Time Finished** column in the Library Log, separate from Time Read (only populates for books actually marked Finished)
- A single font picker combining curated cottage-appropriate fonts with every font installed on your Windows PC (including third-party installs)
- A font-size slider in Settings
- In-app auto-updater — checks for and installs new versions on launch
- Live theme/language switching, no restart required

### Changed
- The Modify window consolidates what used to be scattered right-click dialogs (Rename, Change Cover, Change Background, Book Details) into one tabbed window: General / Time / Cover & Background / Genres / Notes
- Library Log is a single scrollable table (Book, Time Read, Status, Author, Started, Finished On, Time Finished, Rating, Genres), with the Genres column wrapping instead of running on in one line
- All dialogs open centered over the main window with their Save/Close buttons always visible regardless of content height

## v1.1

- Added 10-language support (English, French, Spanish, Russian, Japanese, Korean, Italian, German, Portuguese (Brazil), Chinese (Simplified)), switchable anytime from Settings → Language
- Added "Add Reading Time" — manually log time you read elsewhere (another app, a physical stopwatch), with an optional note that's saved to the book's Notes
- Added a Contact section to the About tab (Discord + a link to this GitHub repo)
- Sort menu now also supports sorting by Author

## v1.0

- Initial release: manual play/pause reading timer, bookshelf with genres/author/notes/1–5 star rating, Library Log stats, custom covers and backgrounds, five cozy color themes, system tray, export/import
