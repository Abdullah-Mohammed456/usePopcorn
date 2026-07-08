# usePopcorn

A movie search and watchlist app built with React. Search movies via the OMDB API, view details, rate them with a star component, and track what you've watched.

## Features

- Search movies by title (OMDB API)
- View movie details (plot, cast, rating, runtime)
- Rate movies with a custom star rating component
- Build and manage a personal watched list
- Summary stats for your watched movies (average ratings, total runtime)
- Collapsible UI panels and keyboard support (Escape to close details)

## Tech Stack

- **React 19** — UI library
- **Vite** — build tool and dev server
- **OMDB API** — movie data
- **CSS** — custom styling (no UI framework)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later
- [npm](https://www.npmjs.com/) (comes with Node)
- A free [OMDB API key](https://www.omdbapi.com/apikey.aspx)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Abdullah-Mohammed456/usepopcorn.git
cd usePopcorn
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and add your OMDB API key:

```env
VITE_OMDB_API_KEY=your_actual_api_key_here
```

> **Note:** Never commit `.env`. It is listed in `.gitignore`.

### 4. Run the development server

```bash
npm run dev
```

Open the URL shown in the terminal (usually `http://localhost:5173`).

## Available Scripts

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start development server         |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |
| `npm run lint`    | Run ESLint                       |

## Project Structure

```
src/
├── main.jsx              # App entry point
├── App.jsx               # Root component (state & API logic)
├── index.css             # Global styles
├── constants.js          # Environment-based config
├── components/           # UI components
│   ├── NavBar.jsx
│   ├── SearchBar.jsx
│   ├── MovieList.jsx
│   ├── MovieDetails.jsx
│   ├── WatchedMovies.jsx
│   ├── StarRating.jsx
│   └── ...
└── utils/
    └── helpers.js        # Shared utility functions
```

## Environment Variables

| Variable            | Description       | Required |
| ------------------- | ----------------- | -------- |
| `VITE_OMDB_API_KEY` | Your OMDB API key | Yes      |

See `.env.example` for the template.

## Deployment

Build the app:

```bash
npm run build
```

The output goes to the `dist/` folder. Deploy that folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

Set `VITE_OMDB_API_KEY` in your hosting provider's environment variables dashboard.

## Learning

This project is part of **The Ultimate React Course** — focused on React fundamentals, component composition, state, effects, and API integration.

## License

This project is open source and available for learning purposes.
