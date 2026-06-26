import { sqliteTable, integer, text, real } from "drizzle-orm/sqlite-core"

export const people = sqliteTable("people", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text(),
  balance: real().default(0),
})

export const expenses = sqliteTable("expenses", {
  id: integer().primaryKey({ autoIncrement: true }),
  description: text(),
  amount: real(),
  paidBy: integer().references(() => people.id),
})
