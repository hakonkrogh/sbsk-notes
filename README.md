# sbsk-notes

Digitize and organize marching band sheet music.

## How it works

1. Scan your sheet music pages (phone camera, flatbed scanner, etc.)
2. Drop the image files into `data/inbox/`
3. Run `sbsk scan` to OCR and preview extracted metadata
4. Run `sbsk organize` to auto-rename and file them into the library

## Scanning tips

- Make sure the title, arranger, and instrument/part info at the top of the page is visible and readable
- PNG, JPG, TIFF, BMP, and WebP are all supported
- Multi-page PDFs are supported — each page is split out and OCR'd independently, so different songs/parts can be in the same PDF
- File names don't matter — they get renamed automatically based on OCR results

## Folder structure

```
data/
├── inbox/          ← put scanned images here
└── library/        ← organized output (auto-generated)
    └── <song>--arr-<arranger>/
        └── <instrument>-<part>.png
```

Example after organizing:

```
data/library/
├── stars-and-stripes-forever--arr-johnson/
│   ├── trumpet-1.png
│   ├── trumpet-2.png
│   └── clarinet-1.png
└── hey-baby--arr-smith/
    ├── alto-sax-1.png
    └── snare-1.png
```

## Prerequisites

- **Node.js** ≥ 18
- **poppler** — required for PDF support (`brew install poppler` on macOS)

## Commands

```sh
sbsk scan                          # OCR inbox images, preview results
sbsk organize                      # move inbox → library with auto-naming
sbsk list                          # browse the library
sbsk list --title "stars"          # filter by song title
sbsk list --instrument "trumpet"   # filter by instrument
sbsk list --arranger "johnson"     # filter by arranger
```
