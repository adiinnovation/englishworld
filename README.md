# ENGLISH WORLD — SPEAK & WIN

A playable 3D spoken-English learning adventure built with HTML, CSS, JavaScript and Three.js.

## Run locally
1. Extract the ZIP.
2. Open the folder in VS Code.
3. Use the Live Server extension to open `index.html`.
   Alternatively run `python -m http.server 8000` in the project folder and visit `http://localhost:8000`.
4. Keep an internet connection available for Three.js and Google Fonts CDN.

## Controls
- W / Up: move forward
- S / Down: move backward
- A / Left: move left
- D / Right: move right
- E: interact with a nearby location
- Touch controls appear on mobile.

## Features
- Procedural 3D city with 12 labelled destinations and NPCs
- 20 English conversation missions across four levels
- English prompts, Malayalam meanings, vocabulary and grammar tips
- Speech synthesis for model answers
- Browser speech recognition where supported, with typing fallback
- XP, coins, mission completion and vocabulary notebook
- Dashboard and saved progress using LocalStorage
- Male/female avatar selection

## Speech recognition
Microphone speech recognition depends on browser support and permissions. Chrome/Edge generally provide the best Web Speech API support. Use HTTPS or localhost, allow microphone permission, and select the SPEAK button. The app uses browser speech recognition; it is not a cloud AI tutor and does not send speech to an AI model.

## Note
This is a functional starter game. The 3D avatar, NPCs and city are procedurally generated Three.js objects rather than imported high-detail character assets. The answer checker accepts several model answers and uses a simple word-overlap similarity score; it is practice feedback, not a formal pronunciation or fluency assessment.
