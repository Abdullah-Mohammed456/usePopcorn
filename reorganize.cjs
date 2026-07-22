/**
 * reorganize.js
 * Moves usePopcorn components into ui/ layout/ movie/ watched/ subfolders
 * and rewrites all import paths across src/ automatically.
 *
 * Usage:
 *   1. Put this file in your project ROOT (same level as package.json)
 *   2. Run: node reorganize.js
 *   3. Check the changes with `git diff` (or just look through the files)
 *   4. Run your app to make sure everything still works
 */

const fs = require("fs");
const path = require("path");

const SRC = path.join(__dirname, "src");
const COMPONENTS = path.join(SRC, "components");
const HOOKS = path.join(SRC, "hooks");

// 1. Define the new folder structure
const structure = {
  ui: [
    "Box.jsx",
    "Loading.jsx",
    "ErrorMessage.jsx",
    "StarRating.jsx",
    "Logo.jsx",
  ],
  layout: ["Main.jsx", "NavBar.jsx", "NumResults.jsx", "SearchBar.jsx"],
  movie: [
    "Movie.jsx",
    "MovieList.jsx",
    "MovieDetails.jsx",
    "SeriesEpisodes.jsx",
  ],
  watched: ["WatchedMovie.jsx", "WatchedMovies.jsx", "Summary.jsx"],
};

// 2. Build a lookup map: "Box" -> "components/ui/Box"
const importMap = {};
for (const [folder, files] of Object.entries(structure)) {
  for (const file of files) {
    const name = path.basename(file, ".jsx");
    importMap[name] = `components/${folder}/${name}`;
  }
}

// useMovies.jsx -> useMovies.js, stays in hooks/
const hookOldPath = path.join(HOOKS, "useMovies.jsx");
const hookNewPath = path.join(HOOKS, "useMovies.js");

// 3. Move component files into their new subfolders
for (const [folder, files] of Object.entries(structure)) {
  const targetDir = path.join(COMPONENTS, folder);
  fs.mkdirSync(targetDir, { recursive: true });

  for (const file of files) {
    const from = path.join(COMPONENTS, file);
    const to = path.join(targetDir, file);
    if (fs.existsSync(from)) {
      fs.renameSync(from, to);
      console.log(`Moved: components/${file} -> components/${folder}/${file}`);
    } else {
      console.warn(`Skipped (not found): components/${file}`);
    }
  }
}

// 4. Rename useMovies.jsx -> useMovies.js
if (fs.existsSync(hookOldPath)) {
  fs.renameSync(hookOldPath, hookNewPath);
  console.log("Renamed: hooks/useMovies.jsx -> hooks/useMovies.js");
} else if (fs.existsSync(hookNewPath)) {
  console.log("useMovies.js already exists, skipping rename.");
} else {
  console.warn("Skipped (not found): hooks/useMovies.jsx");
}

// 5. Walk src/ and rewrite import paths in every .js/.jsx file
function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, callback);
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      callback(fullPath);
    }
  }
}

// Matches: import X from "./components/Box" or "../components/Box" etc.
const importRegex = /(from\s+["'])((?:\.\.?\/)+components\/)([A-Za-z]+)(["'])/g;

let filesChanged = 0;

walk(SRC, (filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  content = content.replace(
    importRegex,
    (match, prefix, pathPart, compName, suffix) => {
      if (importMap[compName]) {
        changed = true;
        // preserve the relative depth (./ or ../ etc.) already used
        const relPrefix = pathPart.match(/^(\.\.?\/)+/)[0];
        return `${prefix}${relPrefix}${importMap[compName]}${suffix}`;
      }
      return match;
    },
  );

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated imports in: ${path.relative(__dirname, filePath)}`);
    filesChanged++;
  }
});

console.log(`\nDone. ${filesChanged} file(s) had imports updated.`);
console.log(
  "Now run your app and check the terminal/browser for any leftover import errors.",
);
