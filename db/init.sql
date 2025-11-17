-- Create items table if it doesn't exist
CREATE TABLE IF NOT EXISTS items (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Seed some demo data if table is empty
INSERT INTO items (name)
SELECT 'First item'
WHERE NOT EXISTS (SELECT 1 FROM items);

INSERT INTO items (name)
SELECT 'Second item'
WHERE NOT EXISTS (SELECT 1 FROM items WHERE name = 'Second item');
