import { Hono } from "hono";

type BookingInput = {
	equipmentId: string;
	borrowerName: string;
	startAt: string;
	endAt: string;
	purpose: string;
};

type BookingRow = BookingInput & { id: string };

const app = new Hono<{ Bindings: Env }>();

const bookingFields = ["equipmentId", "borrowerName", "startAt", "endAt", "purpose"] as const;

async function readJsonObject(request: Request): Promise<Record<string, unknown> | null> {
	try {
		const body: unknown = await request.json();
		if (!body || typeof body !== "object" || Array.isArray(body)) return null;
		return body as Record<string, unknown>;
	} catch {
		return null;
	}
}

function validateBooking(input: Record<string, unknown>): { value?: BookingInput; error?: string } {
	for (const field of bookingFields) {
		if (typeof input[field] !== "string" || input[field].trim() === "") {
			return { error: `${field} is required` };
		}
	}

	const startMs = Date.parse(input.startAt as string);
	const endMs = Date.parse(input.endAt as string);
	if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
		return { error: "startAt and endAt must be valid date/time values" };
	}
	if (startMs >= endMs) return { error: "startAt must be before endAt" };

	return {
		value: {
			equipmentId: (input.equipmentId as string).trim(),
			borrowerName: (input.borrowerName as string).trim(),
			startAt: new Date(startMs).toISOString(),
			endAt: new Date(endMs).toISOString(),
			purpose: (input.purpose as string).trim(),
		},
	};
}

async function equipmentExists(db: D1Database, equipmentId: string): Promise<boolean> {
	const result = await db.prepare("SELECT id FROM equipment WHERE id = ?1").bind(equipmentId).first<{ id: string }>();
	return result !== null;
}

async function hasOverlap(db: D1Database, booking: BookingInput, exceptId?: string): Promise<boolean> {
	const result = await db
		.prepare(
			"SELECT id FROM bookings WHERE equipmentId = ?1 AND startAt < ?2 AND endAt > ?3 AND id != ?4 LIMIT 1",
		)
		.bind(booking.equipmentId, booking.endAt, booking.startAt, exceptId ?? "")
		.first<{ id: string }>();
	return result !== null;
}

app.get("/api/equipment", async (c) => {
	const { results } = await c.env.DB.prepare("SELECT id, name, location FROM equipment ORDER BY id").all();
	return c.json(results);
});

app.get("/api/bookings", async (c) => {
	const { results } = await c.env.DB
		.prepare(
			"SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings ORDER BY startAt, id",
		)
		.all();
	return c.json(results);
});

app.get("/api/bookings/:id", async (c) => {
	const booking = await c.env.DB
		.prepare("SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings WHERE id = ?1")
		.bind(c.req.param("id"))
		.first<BookingRow>();
	if (!booking) return c.json({ error: "Booking not found" }, 404);
	return c.json(booking);
});

app.post("/api/bookings", async (c) => {
	const body = await readJsonObject(c.req.raw);
	if (!body) return c.json({ error: "Request body must be a JSON object" }, 400);
	const validated = validateBooking(body);
	if (!validated.value) return c.json({ error: validated.error }, 400);
	const booking = validated.value;
	if (!(await equipmentExists(c.env.DB, booking.equipmentId))) {
		return c.json({ error: "Equipment not found" }, 404);
	}
	if (await hasOverlap(c.env.DB, booking)) return c.json({ error: "Booking conflicts with an existing booking" }, 409);

	const id = crypto.randomUUID();
	await c.env.DB
		.prepare(
			"INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose) VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
		)
		.bind(id, booking.equipmentId, booking.borrowerName, booking.startAt, booking.endAt, booking.purpose)
		.run();
	return c.json({ id, ...booking }, 201);
});

app.patch("/api/bookings/:id", async (c) => {
	const id = c.req.param("id");
	const existing = await c.env.DB
		.prepare("SELECT id, equipmentId, borrowerName, startAt, endAt, purpose FROM bookings WHERE id = ?1")
		.bind(id)
		.first<BookingRow>();
	if (!existing) return c.json({ error: "Booking not found" }, 404);

	const body = await readJsonObject(c.req.raw);
	if (!body) return c.json({ error: "Request body must be a JSON object" }, 400);
	const validated = validateBooking({ ...existing, ...body });
	if (!validated.value) return c.json({ error: validated.error }, 400);
	const booking = validated.value;
	if (!(await equipmentExists(c.env.DB, booking.equipmentId))) {
		return c.json({ error: "Equipment not found" }, 404);
	}
	if (await hasOverlap(c.env.DB, booking, id)) return c.json({ error: "Booking conflicts with an existing booking" }, 409);

	await c.env.DB
		.prepare(
			"UPDATE bookings SET equipmentId = ?1, borrowerName = ?2, startAt = ?3, endAt = ?4, purpose = ?5 WHERE id = ?6",
		)
		.bind(booking.equipmentId, booking.borrowerName, booking.startAt, booking.endAt, booking.purpose, id)
		.run();
	return c.json({ id, ...booking });
});

app.delete("/api/bookings/:id", async (c) => {
	const result = await c.env.DB.prepare("DELETE FROM bookings WHERE id = ?1").bind(c.req.param("id")).run();
	if (result.meta.changes === 0) return c.json({ error: "Booking not found" }, 404);
	return c.body(null, 204);
});

app.notFound((c) => c.json({ error: "Not found" }, 404));
app.onError((error, c) => {
	console.error(error);
	return c.json({ error: "Internal server error" }, 500);
});

export default app;
