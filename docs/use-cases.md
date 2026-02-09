# Use Cases

## Background

SBSK's marching band maintains a physical archive of sheet music — binders and folders of printed pages accumulated over years. Finding a specific part for a specific song means flipping through stacks of paper. Pages get lost, damaged, or misfiled. When a musician needs their part, someone has to dig through the archive manually.

The goal is to digitize this archive into a searchable, organized digital library.

## Actors

- **Band director** — manages the archive, assigns parts to musicians
- **Section leader** — needs parts for their section before rehearsal
- **Musician** — needs their specific part for a song

## Use Cases

### UC-1: Digitize a batch of sheet music

A band director sits down with a stack of sheet music and a phone/scanner. They scan each page as an image and drop the files into the inbox folder. They run the scan command to verify the OCR correctly identified the song title, arranger, instrument, and part number for each page. If results look good, they run organize to file everything into the library automatically.

### UC-2: Find a specific part

Before rehearsal, a section leader needs the Trumpet 2 part for "Stars and Stripes Forever." They search the library by song title and instrument and get the file path to the correct image.

### UC-3: See what's in the library for a song

The band director wants to check which parts have been digitized for a given song — maybe they know some pages are still missing. They list all entries for that song and see which instruments and parts are accounted for.

### UC-4: See everything by a specific arranger

The band pulls out an old arrangement for a parade. The director filters the library by arranger to find all songs from that arranger and check what's available.

### UC-5: Re-scan a bad page

A page was scanned at a bad angle or the OCR got the metadata wrong. The director drops the re-scanned image into the inbox, runs scan to verify, and organizes it. The new file overwrites the old one in the library since it maps to the same path.

## Future considerations

- **Web interface** — browse and search the library from a phone/tablet at rehearsal, no CLI needed
- **PDF export** — combine multiple parts into a single PDF for printing
- **Missing part detection** — given a known list of instruments in the band, flag which parts haven't been scanned yet for a song
- **Manual metadata override** — when OCR confidence is low, prompt the user to correct title/instrument/part before organizing
