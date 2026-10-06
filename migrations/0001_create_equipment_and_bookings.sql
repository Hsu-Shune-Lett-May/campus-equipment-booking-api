CREATE TABLE equipment (
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	location TEXT NOT NULL
);

CREATE TABLE bookings (
	id TEXT PRIMARY KEY,
	equipmentId TEXT NOT NULL,
	borrowerName TEXT NOT NULL,
	startAt TEXT NOT NULL,
	endAt TEXT NOT NULL,
	purpose TEXT NOT NULL,
	FOREIGN KEY (equipmentId) REFERENCES equipment(id) ON DELETE RESTRICT
);

CREATE INDEX bookings_equipment_time_idx ON bookings (equipmentId, startAt, endAt);

INSERT INTO equipment (id, name, location) VALUES
	('eq-1', 'Projector A', 'Building 1'),
	('eq-2', 'Camera A', 'Building 2');
