# Campus Equipment Booking API

## Purpose

A small API for listing campus equipment and creating, reading, updating, and deleting equipment bookings. It checks that equipment exists, that a booking has a valid time range, and that bookings for the same equipment do not overlap.

## Technology stack

- TypeScript
- Cloudflare Workers with Wrangler
- Hono
- Cloudflare D1
- Vitest with the Cloudflare Workers test plugin

## Install dependencies

From the project directory:

```sh
npm install
```

## Set up the local D1 database

The Worker binds D1 as `DB`. Its configured database name is `campus-equipment-booking`, and the migration is in `migrations/0001_create_equipment_and_bookings.sql`.

Apply the migration to Wrangler's local D1 database:

```sh
npx wrangler d1 migrations apply campus-equipment-booking --local
```

The migration creates the equipment and bookings tables and inserts `eq-1` (Projector A, Building 1) and `eq-2` (Camera A, Building 2).

## Run the API locally

Start the Worker:

```sh
npm run dev
```

The local Base API URL is:

```text
http://localhost:8787/api
```

## Schema

```text
equipment
  id TEXT PRIMARY KEY
  name TEXT NOT NULL
  location TEXT NOT NULL

bookings
  id TEXT PRIMARY KEY
  equipmentId TEXT NOT NULL
  borrowerName TEXT NOT NULL
  startAt TEXT NOT NULL
  endAt TEXT NOT NULL
  purpose TEXT NOT NULL
  equipmentId → equipment.id
```

Each booking refers to one equipment record through `bookings.equipmentId`, which is a foreign key to `equipment.id`.

## API endpoints

| Method | Path | Success |
|---|---|---:|
| GET | `/api/equipment` | 200 |
| GET | `/api/bookings` | 200 |
| GET | `/api/bookings/:id` | 200 |
| POST | `/api/bookings` | 201 |
| PATCH | `/api/bookings/:id` | 200 |
| DELETE | `/api/bookings/:id` | 204 |

Booking request fields are `equipmentId`, `borrowerName`, `startAt`, `endAt`, and `purpose`. PATCH can provide only the fields to update; omitted fields keep their current values.

Example create request:

```sh
curl -i -X POST http://localhost:8787/api/bookings \
  -H 'Content-Type: application/json' \
  -d '{"equipmentId":"eq-1","borrowerName":"Somchai Jaidee","startAt":"2026-10-20T09:00:00.000Z","endAt":"2026-10-20T11:00:00.000Z","purpose":"Class presentation"}'
```

Example successful response (`201 Created`; the API generates the ID):

```json
{
  "id": "<generated-uuid>",
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

See [API_CONTRACT.md](API_CONTRACT.md) for request fields, status codes, error format, and the booking overlap rule.

## Run tests

Run the test suite once:

```sh
npm test -- --run
```

The current automated API test checks that `GET /api/equipment` returns the two seeded equipment records.
