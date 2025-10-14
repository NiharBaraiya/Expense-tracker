/*
  Fix script for budgets: removes documents with null userId and ensures a partial unique index on { userId, category }
  Usage: node server/utils/fixNullBudgets.js
  WARNING: This will delete documents with null userId. Backup your DB if necessary.
*/

require('dotenv').config();
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('Missing MONGO_URI in environment. Set it in server/.env');
  process.exit(1);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collName = 'budgets';

    // Drop legacy index that may reference `user` (not `userId`) which causes the dup key on user:null
    try {
      const indexes = await db.collection(collName).indexes();
      const legacy = indexes.find(i => i.key && (i.key.user === 1 || i.name === 'user_1_category_1'));
      if (legacy) {
        console.log(`Dropping legacy index: ${legacy.name}`);
        await db.collection(collName).dropIndex(legacy.name);
        console.log('Dropped legacy index');
      }
    } catch (dropErr) {
      // ignore if index doesn't exist or drop fails
      console.warn('Index drop check failed (continuing):', dropErr.message || dropErr);
    }

    // 1) Show count of problematic docs
    const nullCount = await db.collection(collName).countDocuments({ userId: { $in: [null] } });
    console.log(`Found ${nullCount} budget(s) with null userId`);

    if (nullCount > 0) {
      console.log('Deleting documents with null userId...');
      const delRes = await db.collection(collName).deleteMany({ userId: { $in: [null] } });
      console.log(`Deleted ${delRes.deletedCount} document(s)`);
    } else {
      console.log('No null-user budgets found');
    }

    // 2) Create partial unique index so uniqueness enforced only for real users
    console.log('Creating partial unique index on { userId: 1, category: 1 } (ignores null userId)');
    try {
      await db.collection(collName).createIndex(
        { userId: 1, category: 1 },
        { unique: true, partialFilterExpression: { userId: { $exists: true, $ne: null } } }
      );
      console.log('Partial unique index created (or already exists)');
    } catch (idxErr) {
      console.error('Failed to create index:', idxErr.message || idxErr);
    }

    console.log('Done.');
    process.exit(0);
  } catch (err) {
    console.error('Error running migration:', err);
    process.exit(1);
  }
}

run();
