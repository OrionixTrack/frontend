# orionix-track-frontend

Vue 3 + Vite frontend for OrionixTrack with an `Ops Command` visual direction and role-based authentication for:

- `Company Owner`
- `Dispatcher`

## Environment

Create a `.env.local` file if you want to point the app to a backend other than the default:

```sh
VITE_API_BASE_URL=http://localhost:3000
```

If the variable is omitted, the frontend falls back to `http://localhost:3000`.

## Auth behavior

- Owner login uses `POST /auth/owner/login`
- Dispatcher login uses `POST /auth/dispatcher/login`
- The app stores `access_token`, `role`, and the returned user object in `localStorage`
- After reload, the session is restored and the visible workspace changes by role

## Project setup

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
```
