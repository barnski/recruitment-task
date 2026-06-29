import type { Route } from "./+types/people"
import { useEffect, useRef } from "react"
import { useFetcher } from "react-router"
import { eq, sql } from "drizzle-orm"
import { db } from "~/db.server"
import { people } from "~/schema"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { formatDollars } from "~/lib/format"

export function meta(_: Route.MetaArgs) {
  return [{ title: "People · Shared Tab" }]
}

export function loader() {
  return { people: db.select().from(people).all() }
}

export async function action({ request }: Route.ActionArgs) {
  const fd = await request.formData()

  if (fd.get("intent") === "payment") {
    const personId = Number(fd.get("personId"))
    const amount = Number(fd.get("amount"))
    db.update(people)
      .set({ balance: sql`${people.balance} - ${amount}` }) // settle: subtract
      .where(eq(people.id, personId))
      .run()
  }

  return { ok: true }
}

export default function People({ loaderData }: Route.ComponentProps) {
  const paymentFetcher = useFetcher()
  const paymentFormRef = useRef<HTMLFormElement>(null)
  useEffect(() => {
    if (paymentFetcher.state === "idle" && paymentFetcher.data?.ok) {
      paymentFormRef.current?.reset()
    }
  }, [paymentFetcher.state, paymentFetcher.data])

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {loaderData.people.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between py-3"
            >
              <span className="font-medium">{p.name}</span>
              <span
                className={
                  "slashed-zero tabular-nums " +
                  ((p.balance ?? 0) > 0
                    ? "text-red-600"
                    : "text-muted-foreground")
                }
              >
                {formatDollars(p.balance ?? 0)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record payment</CardTitle>
        </CardHeader>
        <CardContent>
          <paymentFetcher.Form
            ref={paymentFormRef}
            method="post"
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="payment-person">Person</Label>
              <select
                id="payment-person"
                name="personId"
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
              >
                {loaderData.people.map((p) => (
                  <option value={p.id} key={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount</Label>
              <Input
                id="payment-amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <input type="hidden" name="intent" value="payment" />
            <Button type="submit" className="w-full">
              Record payment
            </Button>
          </paymentFetcher.Form>
        </CardContent>
      </Card>
    </>
  )
}
