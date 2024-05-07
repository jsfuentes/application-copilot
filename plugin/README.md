# Chrome Plugin Base

Chrome Plugin boilerplate with great development tooling:

- Basic service_worker
- Basic content script injected into every page
- Basic popup with React
- Basic options page
- `.babelrc` and parcel building adds support for Typescript v5, React v18, and Tailwind CSS v3
- Config setup offering user info, isDev, and custom config json importing based on packed or unpacked plugin
- Debugging Code
    - `debug` package setup to only print in development when you turn on verbose console logging
        - prints all messages and local storage changes
    - Sourcemaps setup for debugging original code
- Prettier and Eslint setup

## Setup

- `npm`
- `npm run watch` for the first time files
- On chrome://extensions, load unpacked dist folder

### Dev

- `npm run watch`
- Make sure to refresh chrome plugin
- Win big

### Prod

- `npm run build` then package for dist mode
