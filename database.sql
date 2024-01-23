CREATE TABLE sets (
    id serial PRIMARY KEY,
    set_name text,
    set_code text
);

CREATE TABLE artists (
    id serial PRIMARY KEY,
    artist_name text
);

CREATE TABLE cards (
    id serial PRIMARY KEY,
    card_name text,
    card_type text,
    color text,
    rarity text,
    collector_number text,
    set_id integer REFERENCES sets (id),
    artist_id integer REFERENCES artists (id)
);

INSERT INTO sets (set_name, set_code) VALUES ('Eldritch Moon', 'EMN');
INSERT INTO artists (artist_name) VALUES ('Chris Rahn');
INSERT INTO cards (card_name, card_type, color, rarity, collector_number, set_id, artist_id) VALUES ('Nahiris Wrath', 'Sorcery', 'Red', 'Mythic Rare', '137/205', 1, 1);

INSERT INTO sets (set_name, set_code) VALUES ('Shadows Over Innistrad', 'SOI');
INSERT INTO cards (card_name, card_type, color, rarity, collector_number, set_id, artist_id) VALUES ('Stallion of Ashmouth', 'Creature - Nightmare Horse', 'Black', 'Common', '136/297', 2, 1);

INSERT INTO artists (artist_name) VALUES ('Svetlin Velinov');
INSERT INTO cards (card_name, card_type, color, rarity, collector_number, set_id, artist_id) VALUES ('Boon of Emrakul', 'Enchantment - Aura', 'Black', 'Common', '081/205', 1, 2);
