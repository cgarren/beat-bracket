import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/Layout"

const NotFoundPage = () => {
  return (
    <Layout noChanges={true}>
      <main className="text-center">
        <h1 className="font-bold text-2xl mb-2">Page not found</h1>
        <button class="border-black"><Link to="/">Go home</Link></button>
      </main>
    </Layout>
  )
}

export default NotFoundPage

export function Head() {
  return (
    <title>Page not found</title>
  )
}