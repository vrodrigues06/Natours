import mongoose from 'mongoose';
import 'dotenv/config';
import fs from 'node:fs';
import { Tours } from '../../models/tour-model.js';
import path from 'node:path';
import { Users } from '../../models/user-model.js';
import { Reviews } from '../../models/review-model.js';

const DB = process.env.DATABASE;

if (!DB) {
  throw new Error('DATABASE environment variable is not defined');
}

mongoose.connect(DB).then(() => console.log('DB connection successful!'));

// READ JSON FILE
const __dirname = path.resolve(); // se estiver usando ESModules
const filePath = path.join(__dirname, 'dev-data', 'data', 'tours.json');
const filePathUsers = path.join(__dirname, 'dev-data', 'data', 'users.json');
const filePathReviews = path.join(
  __dirname,
  'dev-data',
  'data',
  'reviews_realistic.json'
);

const tours = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
const users = JSON.parse(fs.readFileSync(filePathUsers, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(filePathReviews, 'utf-8'));
// IMPORT DATA INTO DB
const importData = async () => {
  try {
    await Tours.create(tours);
    await Users.create(users, { validateBeforeSave: false });
    await Reviews.create(reviews);
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tours.deleteMany();
    await Reviews.deleteMany();
    await Users.deleteMany();
    console.log('Data successfully deleted!');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
