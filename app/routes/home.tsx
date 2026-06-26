import type { Route } from "./+types/home"
import { Welcome } from "../welcome/welcome"
import { db } from "~/db.server"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ]
}

export function loader() {
  return { 
  }
}

export default function Home() {
  return <Welcome />
}
