const express = require('express');
const multer = require('multer');
const db = require('../db');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'public/images/');
  },
  filename(req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();
/* GET home page. */
router.get('/', async (req, res) => {
  let query = 'SELECT * FROM cards';
  let nameSort = '/?sort=card_name_ascend';
  let typeSort = '/?sort=card_type_ascend';
  let colorSort = '/?sort=color_ascend';
  let raritySort = '/?sort=rarity_ascend';
  const params = [];

  if (req.query.name_search) {
    query += ' WHERE card_name ILIKE $1';
    params.push('%' + req.query.name_search + '%');
  } else if (req.query.type_search) {
    query += ' WHERE card_type ILIKE $1';
    params.push('%' + req.query.type_search + '%');
  } else if (req.query.color_search) {
    query += ' WHERE color ILIKE $1';
    params.push('%' + req.query.color_search + '%');
  } else if (req.query.rarity_search) {
    query += ' WHERE rarity ILIKE $1';
    params.push('%' + req.query.rarity_search + '%');
  }

  if (req.query.sort === 'card_name_ascend') {
    query += ' ORDER BY card_name';
    nameSort = '/?sort=card_name_descend';
  } else if (req.query.sort === 'card_name_descend') {
    query += ' ORDER BY card_name DESC';
    nameSort = '/?sort=card_name_ascend';
  } else if (req.query.sort === 'card_type_ascend') {
    query += ' ORDER BY card_type';
    typeSort = '/?sort=card_type_descend';
  } else if (req.query.sort === 'card_type_descend') {
    query += ' ORDER BY card_type DESC';
    typeSort = '/?sort=card_type_ascend';
  } else if (req.query.sort === 'color_ascend') {
    query += ' ORDER BY color';
    colorSort = '/?sort=color_descend';
  } else if (req.query.sort === 'color_descend') {
    query += ' ORDER BY color DESC';
    colorSort = '/?sort=color_ascend';
  } else if (req.query.sort === 'rarity_ascend') {
    query += ' ORDER BY rarity';
    raritySort = '/?sort=rarity_descend';
  } else if (req.query.sort === 'rarity_descend') {
    query += ' ORDER BY rarity DESC';
    raritySort = '/?sort=rarity_ascend';
  }

  const result = await db.query(query, params);

  res.render('index', {
    title: 'Ethan Chapels MTG Collection Manager',
    cards: result.rows,
    nameSort,
    typeSort,
    colorSort,
    raritySort,
  });
});

router.get('/addCard', (req, res) => {
  res.render('addCard');
});
router.get('/addSet', (req, res) => {
  res.render('addSet');
});
router.get('/addArtist', (req, res) => {
  res.render('addArtist');
});

router.post('/addSet', async (req, res) => {
  const queryAddSet = 'INSERT INTO sets (set_name, set_code) VALUES ($1, $2)';

  await db.query(queryAddSet, [req.body.set_name, req.body.set_code]);

  res.redirect('/');
});
router.post('/addArtist', async (req, res) => {
  const queryAddArtist = 'INSERT INTO artists (artist_name) VALUES ($1)';

  await db.query(queryAddArtist, [req.body.artist_name]);

  res.redirect('/');
});

router.post('/addCard', async (req, res) => {
  const queryAddCard =
    'INSERT INTO cards (card_name, card_type, color, rarity, collector_number, set_id, artist_id) VALUES ($1, $2, $3, $4, $5, $6, $7)';
  const querysetId = 'SELECT id FROM sets WHERE set_code LIKE $1';
  const queryartistId = 'SELECT id FROM artists WHERE artist_name LIKE $1';

  const setId = await db.query(querysetId, [req.body.set_code]);
  const artistId = await db.query(queryartistId, [req.body.artist_name]);

  await db.query(queryAddCard, [
    req.body.card_name,
    req.body.card_type,
    req.body.color,
    req.body.rarity,
    req.body.collector_number,
    setId.rows[0].id,
    artistId.rows[0].id,
  ]);
  res.redirect('/');
});

router.get('/cardView/:name', async (req, res) => {
  const cardName = req.params.name;
  const result = await db.query(
    'SELECT * FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const setResult = await db.query(
    'SELECT * FROM sets INNER JOIN cards ON sets.id = cards.set_id WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const artistResult = await db.query(
    'SELECT * FROM artists INNER JOIN cards ON artists.id = cards.artist_id WHERE card_name ILIKE $1',
    [req.params.name]
  );

  const cardType = await db.query(
    'SELECT card_type FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardColor = await db.query(
    'SELECT color FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardRarity = await db.query(
    'SELECT rarity FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardNumber = await db.query(
    'SELECT collector_number FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const imgFile = await db.query(
    'SELECT img_file FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const setName = await db.query(
    'SELECT set_name FROM sets INNER JOIN cards ON sets.id = cards.set_id WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const setCode = await db.query(
    'SELECT set_code FROM sets INNER JOIN cards ON sets.id = cards.set_id WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const artist = await db.query(
    'SELECT artist_name FROM artists INNER JOIN cards ON artists.id = cards.artist_id WHERE card_name ILIKE $1',
    [req.params.name]
  );

  let hasImg = false;

  if (imgFile.rows[0].img_file !== null) {
    hasImg = true;
  }

  res.render('cardView', {
    cards: result.rows,
    card_name: cardName,
    card_type: cardType,
    color: cardColor,
    rarity: cardRarity,
    collector_number: cardNumber,
    sets: setResult.rows,
    set_name: setName,
    set_code: setCode,
    artists: artistResult.rows,
    artist_name: artist,
    img_file: imgFile.rows[0].img_file,
    hasImg,
  });
});

router.get('/edit/:name', async (req, res) => {
  const cardName = req.params.name;
  const result = await db.query(
    'SELECT * FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );

  const cardType = await db.query(
    'SELECT card_type FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardColor = await db.query(
    'SELECT color FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardRarity = await db.query(
    'SELECT rarity FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const cardNumber = await db.query(
    'SELECT collector_number FROM sets WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const setId = await db.query(
    'SELECT set_id FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );
  const artistId = await db.query(
    'SELECT artist_id FROM cards WHERE card_name ILIKE $1',
    [req.params.name]
  );

  let isCommon = false;
  let isUncommon = false;
  let isRare = false;
  let isMythic = false;

  if (cardRarity.rows[0].rarity === 'Mythic Rare') {
    isMythic = true;
  } else if (cardRarity.rows[0].rarity === 'Common') {
    isCommon = true;
  } else if (cardRarity.rows[0].rarity === 'Uncommon') {
    isUncommon = true;
  } else {
    isRare = true;
  }

  res.render('edit', {
    cards: result.rows,
    card_name: cardName,
    card_type: cardType,
    color: cardColor,
    rarity: cardRarity,
    collector_number: cardNumber,
    set_id: setId,
    artist_id: artistId,
    is_mythic: isMythic,
    is_common: isCommon,
    is_uncommon: isUncommon,
    is_rare: isRare,
  });
});
router.post('/edit/:name', async (req, res) => {
  const queryUpdateName =
    'UPDATE cards SET card_name = $1 WHERE card_name ILIKE $2';
  const queryUpdateType =
    'UPDATE cards SET card_type = $1 WHERE card_name ILIKE $2';
  const queryUpdateColor =
    'UPDATE cards SET color = $1 WHERE card_name ILIKE $2';
  const queryUpdateRarity =
    'UPDATE cards SET rarity = $1 WHERE card_name ILIKE $2';
  const queryUpdateNumber =
    'UPDATE cards SET collector_number = $1 WHERE card_name ILIKE $2';
  const queryUpdateSet =
    'UPDATE cards SET set_id = $1 WHERE card_name ILIKE $2';
  const queryUpdateArtist =
    'UPDATE cards SET artist_id = $1 WHERE card_name ILIKE $2';

  await db.query(queryUpdateName, [req.body.card_name, req.params.name]);
  await db.query(queryUpdateType, [req.body.card_type, req.params.name]);
  await db.query(queryUpdateColor, [req.body.color, req.params.name]);
  await db.query(queryUpdateRarity, [req.body.rarity, req.params.name]);
  await db.query(queryUpdateNumber, [
    req.body.collector_number,
    req.params.name,
  ]);
  await db.query(queryUpdateArtist, [req.body.artist_id, req.params.name]);
  await db.query(queryUpdateSet, [req.body.set_id, req.params.name]);

  res.redirect('/');
});

router.get('/deleteConf/:name', (req, res) => {
  res.render('deletionConf', {
    name: req.params.name,
    item: 'card',
    table: 'cards',
  });
});
router.get('/delete/:table/:name', async (req, res) => {
  let deleteItem;
  if (req.params.table === 'cards') {
    deleteItem = 'DELETE FROM cards WHERE card_name = $1';
  } else if (req.params.table === 'sets') {
    deleteItem = 'DELETE FROM sets WHERE set_name = $1';
  } else {
    deleteItem = 'DELETE FROM artists WHERE artist_name = $1';
  }

  await db.query(deleteItem, [req.params.name]);
  res.redirect('/');
});

router.get('/sets', async (req, res) => {
  const query = 'SELECT * FROM sets';

  const result = await db.query(query);

  res.render('listSets', {
    sets: result.rows,
  });
});
router.get('/artists', async (req, res) => {
  const query = 'SELECT * FROM artists';

  const result = await db.query(query);

  res.render('listArtists', {
    artists: result.rows,
  });
});

router.get('/deleteSet/:name', async (req, res) => {
  const checkSet =
    'SELECT * FROM cards INNER JOIN sets ON cards.set_id = sets.id WHERE set_name ILIKE $1';
  const result = await db.query(checkSet, [req.params.name]);
  try {
    if (result.rows[0].card_name !== '') {
      res.render('deleteError', {
        cards: result.rows,
        item: 'set',
      });
    }
  } catch (error) {
    res.render('deletionConf', {
      item: 'set',
      table: 'sets',
      name: req.params.name,
    });
  }
});
router.get('/deleteArtist/:name', async (req, res) => {
  const checkArtist =
    'SELECT * FROM cards INNER JOIN artists ON cards.artist_id = artists.id WHERE artist_name ILIKE $1';
  const result = await db.query(checkArtist, [req.params.name]);
  try {
    if (result.rows[0].card_name !== '') {
      res.render('deleteError', {
        cards: result.rows,
        item: 'artist',
      });
    }
  } catch (error) {
    res.render('deletionConf', {
      item: 'artist',
      table: 'artists',
      name: req.params.name,
    });
  }
});

router.get('/editSet/:name', async (req, res) => {
  const result = await db.query('SELECT * FROM sets WHERE set_name ILIKE $1', [
    req.params.name,
  ]);

  res.render('editSet', {
    sets: result.rows,
    name: req.params.name,
  });
});
router.post('/editSet/:name', async (req, res) => {
  const queryUpdateSetName =
    'UPDATE sets SET set_name = $1 WHERE set_name ILIKE $2';
  const queryUpdateSetCode =
    'UPDATE sets SET set_code = $1 WHERE set_name ILIKE $2';
  await db.query(queryUpdateSetName, [req.body.set_name, req.params.name]);
  await db.query(queryUpdateSetCode, [req.body.set_code, req.params.name]);

  res.redirect('/');
});

router.get('/editArtist/:name', async (req, res) => {
  const result = await db.query(
    'SELECT * FROM artists WHERE artist_name ILIKE $1',
    [req.params.name]
  );

  res.render('editArtist', {
    artists: result.rows,
    name: req.params.name,
  });
});
router.post('/editArtist/:name', async (req, res) => {
  const queryUpdateArtistName =
    'UPDATE artists SET artist_name = $1 WHERE artist_name ILIKE $2';
  await db.query(queryUpdateArtistName, [
    req.body.artist_name,
    req.params.name,
  ]);

  res.redirect('/');
});

router.post('/photo/:name', upload.single('photo'), async (req, res) => {
  // Other code here; details about the file are in req.file See https://github.com/expressjs/multer#file-information (Links to an external site.)
  // For example, the file name of the uploaded file is in req.file.originalname
  const queryUpdatePhoto =
    'UPDATE cards SET img_file = $1 WHERE card_name ILIKE $2';
  await db.query(queryUpdatePhoto, [req.file.originalname, req.params.name]);
  res.redirect('/');
});

router.get('/deletePhoto/:name', async (req, res) => {
  const deletePhoto = 'UPDATE cards SET img_file = $1 WHERE card_name ILIKE $2';
  await db.query(deletePhoto, [null, req.params.name]);
  res.redirect('/');
});

module.exports = router;
