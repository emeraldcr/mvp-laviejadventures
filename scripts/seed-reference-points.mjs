#!/usr/bin/env node
import { MongoClient } from "mongodb";

const URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB = process.env.MONGODB_DB || "lva";

const REFERENCE_POINTS = [
  { id: "la-vieja", name: "La Vieja Adventures", lat: 10.586, lng: -84.532 },
  { id: "san-vicente", name: "San Vicente", lat: 10.578, lng: -84.528 },
  { id: "alajuela", name: "Alajuela", lat: 10.021, lng: -84.215 },
  { id: "san-jose", name: "San Jose", lat: 9.9281, lng: -84.0907 },
  { id: "ciudad-quesada", name: "Ciudad Quesada", lat: 10.371, lng: -84.421 },
  { id: "la-fortuna", name: "La Fortuna", lat: 10.471, lng: -84.645 },
  { id: "san-carlos", name: "San Carlos", lat: 10.331, lng: -84.428 },
  { id: "hotel-airbnb", name: "Hotel / Airbnb", lat: 10.331, lng: -84.428 },
  // Add more references as needed; you can later seed thousands from a CSV
];

async function main() {
  const client = new MongoClient(URI);
  try {
    console.log(`Connecting to ${URI} (db: ${DB})`);
    await client.connect();
    const db = client.db(DB);
    const coll = db.collection("reference_points");

    for (const point of REFERENCE_POINTS) {
      const filter = { id: point.id };
      const update = { $set: { ...point, updatedAt: new Date() } };
      await coll.updateOne(filter, update, { upsert: true });
      console.log(`Upserted reference: ${point.id} -> ${point.name}`);
    }

    const count = await coll.countDocuments();
    console.log(`Reference points collection now has ${count} documents.`);
    console.log("Seed completed successfully.");
  } catch (err) {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();
