-- Seed a system user then spots referencing that user.

INSERT INTO users (id, username, email, display_name, created_at, updated_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'system', 'system@example.com', 'System', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO NOTHING;

INSERT INTO dive_spots (id, name, description, latitude, longitude, address, max_depth, difficulty, water_type, avg_visibility, avg_temperature, created_by)
VALUES
('11111111-1111-1111-1111-111111111111','Two Oceans Aquarium','Perfect for beginners with excellent visibility and diverse marine life', -33.9028, 18.4201, 'V&A Waterfront, Cape Town', 12, 'Beginner', 'Salt', 15, 16, '00000000-0000-0000-0000-000000000001'),
('22222222-2222-2222-2222-222222222222','Seal Island','Famous for Great White shark cage diving and seal colonies', -34.1369, 18.5819, 'False Bay, Cape Town', 25, 'Intermediate', 'Salt', 10, 18, '00000000-0000-0000-0000-000000000001'),
('33333333-3333-3333-3333-333333333333','Atlantis Reef','Pristine reef system with incredible kelp forests', -33.8567, 18.3026, 'Atlantic Seaboard, Cape Town', 20, 'Intermediate', 'Salt', 12, 15, '00000000-0000-0000-0000-000000000001'),
('44444444-4444-4444-4444-444444444444','Castle Rock','Dramatic underwater topography with caves and swim-throughs', -34.3578, 18.4678, 'Cape Peninsula, Cape Town', 30, 'Advanced', 'Salt', 8, 14, '00000000-0000-0000-0000-000000000001'),
('55555555-5555-5555-5555-555555555555','Windmill Beach','Shore diving with beautiful reefs and easy entry', -34.1950, 18.4503, 'Simon''s Town, Cape Town', 15, 'Beginner', 'Salt', 12, 17, '00000000-0000-0000-0000-000000000001'),
('66666666-6666-6666-6666-666666666666','Pyramid Rock','Advanced dive site with strong currents and pelagic fish', -34.2156, 18.4789, 'Miller''s Point, Cape Town', 35, 'Advanced', 'Salt', 6, 13, '00000000-0000-0000-0000-000000000001');
