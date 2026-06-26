import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "../app/schema"

const sqlite = new Database("app.db")
const db = drizzle(sqlite, { schema })

// Reset to a known state (clear expenses first because of the FK to people).
db.delete(schema.expenses).run()
db.delete(schema.people).run()

db.insert(schema.people)
  .values([{ name: "Alice" }, { name: "Bob" }, { name: "Cara" }])
  .run()

console.log("Seeded people:", db.select().from(schema.people).all())
sqlite.close()
