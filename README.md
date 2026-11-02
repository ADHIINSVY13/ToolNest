# ToolNest

My little drawer of tools and games, built with plain HTML, CSS and JavaScript while learning front-end development. No frameworks, no build step, no sign-ups.

**Live site:** https://adhiinsvy13.github.io/ToolNest/

## What's inside

**Tools**
- Calculator, with keyboard support
- Unit Converter for length, weight and temperature
- Password Generator with adjustable length and character sets
- Stopwatch and Timer
- Word Counter with characters, sentences and reading time
- BMI Calculator

**Games**
- Tic Tac Toe for two players, with a running score
- Rock Paper Scissors against the computer
- Number Guess, find the secret number from 1 to 100
- Memory Match, flip cards and find the pairs

## Features

- Search across every tool and game
- Pin favourites to the top of the page
- Light and dark theme
- Scores, best results, favourites and theme are saved in your browser (localStorage)
- Confetti when you win
- Responsive layout that works on phones
- Respects `prefers-reduced-motion`

## Built with

- HTML5
- CSS3 (custom properties, grid, flexbox)
- Vanilla JavaScript (hash-based routing, no libraries)

## Run it locally

No install needed. Clone the repo and open `index.html` in your browser.

```bash
git clone https://github.com/ADHIINSVY13/ToolNest.git
cd ToolNest
```

Or serve it locally with any static server, for example `python -m http.server`.

## Project structure

```
ToolNest/
├── index.html   page shell, fonts and header
├── style.css    all styles, including the light and dark themes
└── app.js       tool registry, router and every tool and game
```

## Adding your own tool

1. Add an entry to the `TOOLS` list at the top of `app.js` with an `id`, `icon`, `name`, `type` (`tool` or `game`), `desc` and a `render` function.
2. Add a colour and a short note for it in the `LOOK` object.
3. Write the `render(el)` function that fills the given element.

## Author

Made by [Divyanshi Sahu](https://github.com/ADHIINSVY13).
