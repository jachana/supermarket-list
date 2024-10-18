import { MongoClient, Db } from 'mongodb';

let db: Db | null = null;

export async function connectToDatabase() {
  if (db) return db;

  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  await client.connect();
  db = client.db('groceryListDB');
  return db;
}

export async function getGroceryItems() {
  const database = await connectToDatabase();
  return database.collection('groceryItems').find({}).toArray();
}

export async function addGroceryItem(item: { name: string; quantity: number }) {
  const database = await connectToDatabase();
  return database.collection('groceryItems').insertOne(item);
}

export async function removeGroceryItem(id: string) {
  const database = await connectToDatabase();
  return database.collection('groceryItems').deleteOne({ _id: id });
}
