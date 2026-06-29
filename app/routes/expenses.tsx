import type { Route } from "./+types/expenses"
import { useEffect, useRef } from "react"
import { Form, useFetcher } from "react-router"
import { eq, sql } from "drizzle-orm"
import { db } from "~/db.server"
import { expenses, people } from "~/schema"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { formatDollars } from "~/lib/format"


export function meta(_: Route.MetaArgs) {
  return [{ title: "Expenses · Shared Tab" }]
}

export function loader() {
  return {
    people: db.select().from(people).all(),
    expenses: db.select().from(expenses).all(),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData()
  const intent = fd.get("intent")

  if (intent === "add-expense") {
    db.insert(expenses)
      .values({
        description: String(fd.get("description")),
        amount: Number(fd.get("amount")),
        paidBy: Number(fd.get("paidBy")),
      })
      .run()
  }

  if (intent === "split") {
    const expenseId = Number(fd.get("expenseId"))
    const personIds = fd.getAll("personIds").map(Number)
    if (personIds.length === 0) return { ok: true }

    const expense = db
      .select()
      .from(expenses)
      .where(eq(expenses.id, expenseId))
      .get()
    const share = (expense?.amount ?? 0) / personIds.length

    for (const pid of personIds) {
      db.update(people)
        .set({ balance: sql`${people.balance} + ${share}` }) // atomic increment
        .where(eq(people.id, pid))
        .run()
    }
  }

  return { ok: true }
}

export default function Expenses({ loaderData }: Route.ComponentProps) {
  const expenseFetcher = useFetcher()
  const expenseFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (expenseFetcher.state === "idle" && expenseFetcher.data?.ok) {
      expenseFormRef.current?.reset()
    }
  }, [expenseFetcher.state, expenseFetcher.data])

  const nameById = new Map(loaderData.people.map((p) => [p.id, p.name]))

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Add expense</CardTitle>
        </CardHeader>
        <CardContent>
          <expenseFetcher.Form
            ref={expenseFormRef}
            method="post"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                name="description"
                placeholder="Dinner, groceries…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paidBy">Paid by</Label>
              <select
                id="paidBy"
                name="paidBy"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                {loaderData.people.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <input type="hidden" name="intent" value="add-expense" />
            <Button type="submit" className="w-full">
              Add expense
            </Button>
          </expenseFetcher.Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {loaderData.expenses.length === 0 && (
            <p className="py-3 text-sm text-muted-foreground">
              No expenses yet.
            </p>
          )}
          {loaderData.expenses.map((e) => (
            <div key={e.id} className="space-y-3 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{e.description}</div>
                  <div className="text-sm text-muted-foreground">
                    paid by {nameById.get(e.paidBy ?? -1) ?? "Unknown"}
                  </div>
                </div>
                <span className="slashed-zero tabular-nums">
                  {formatDollars(e.amount ?? 0)}
                </span>
              </div>

              <Form
                method="post"
                className="flex flex-wrap items-center gap-x-4 gap-y-2"
              >
                <input type="hidden" name="intent" value="split" />
                <input type="hidden" name="expenseId" value={e.id} />
                {loaderData.people.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-center gap-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="personIds"
                      value={p.id}
                      className="size-4"
                    />
                    {p.name}
                  </label>
                ))}
                <Button
                  type="submit"
                  size="sm"
                  variant="secondary"
                  className="ml-auto"
                >
                  Split
                </Button>
              </Form>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  )
}
