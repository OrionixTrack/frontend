# OrionixTrack Frontend

Frontend application for OrionixTrack built with Vue 3, TypeScript, and Vite.

The application includes:
- role-based sign-in for `Company Owner` and `Dispatcher`
- dashboard workspace with role-aware content
- shared UI components and composables
- feature-based architecture

## Tech Stack

- Vue 3
- TypeScript
- Vue Router 4
- Vite
- ESLint

## Project Structure

```text
src/
├── views/        # Route-level views
├── features/     # Feature modules
├── shared/       # Reusable UI and utilities
├── core/         # Global services and stores
├── router/       # Routing and guards
└── assets/       # Global styles and static assets
```

## Environment

Create a `.env.local` file to override the backend URL:

```sh
VITE_API_BASE_URL=http://localhost:3000
```

If not provided, the app uses `http://localhost:3000`.

## Development

```sh
npm install
npm run dev
```

## Available Scripts

```sh
npm run dev
npm run build
npm run typecheck
npm run lint
npm run preview
```
