# Campus Equipment Booking API Contract

## Base URL

```text
http://localhost:8787/api
```

All paths below are relative to this Base URL.

## Endpoints

| Method | Path | Request body | Success |
|---|---|---|---:|
| GET | `/equipment` | None | 200 |
| GET | `/bookings` | None | 200 |
| GET | `/bookings/:id` | None | 200 |
| POST | `/bookings` | Required booking fields | 201 |
| PATCH | `/bookings/:id` | Any booking fields being changed | 200 |
| DELETE | `/bookings/:id` | None | 204 |

`GET /equipment` returns an array of equipment objects containing `id`, `name`, and `location`.

Booking responses contain `id`, `equipmentId`, `borrowerName`, `startAt`, `endAt`, and `purpose`.

## Booking fields

| Field | Type | Requirement |
|---|---|---|
| `equipmentId` | string | Required; must refer to existing equipment |
| `borrowerName` | string | Required and non-empty |
| `startAt` | date/time string | Required and must be before `endAt` |
| `endAt` | date/time string | Required and must be after `startAt` |
| `purpose` | string | Required and non-empty |

POST requires all five fields. PATCH accepts a partial body, applies the supplied fields to the existing booking, and validates the resulting booking.

Example booking body:

```json
{
  "equipmentId": "eq-1",
  "borrowerName": "Somchai Jaidee",
  "startAt": "2026-10-20T09:00:00.000Z",
  "endAt": "2026-10-20T11:00:00.000Z",
  "purpose": "Class presentation"
}
```

## Error status codes

| Status | Meaning |
|---:|---|
| 400 | Invalid or missing request data, including a malformed/non-object JSON body or invalid time range |
| 404 | Requested booking, equipment, or route was not found |
| 409 | Booking time conflicts with an existing booking for the same equipment |
| 500 | Unexpected server error |

Every error response uses JSON in this format:

```json
{
  "error": "A clear error message"
}
```

## Booking overlap rule

For the same equipment, a new booking conflicts when:

```text
newStart < existingEnd AND newEnd > existingStart
```

Bookings whose end and start times touch are allowed. Bookings for different equipment can overlap. When checking a PATCH, the current booking ID is excluded from the conflict query.

## Schema relationship

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

`bookings.equipmentId` is a foreign key referencing `equipment.id`.
