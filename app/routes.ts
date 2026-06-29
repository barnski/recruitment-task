import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  // A layout route renders the shared shell (nav + <Outlet/>) and adds NO url segment.
  layout("routes/layout.tsx", [
    index("routes/people.tsx"), //              "/"
    route("expenses", "routes/expenses.tsx"), // "/expenses"
  ]),
] satisfies RouteConfig

