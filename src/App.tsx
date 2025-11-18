import React, { useState } from "react"
import { Button } from "@/components/ui/button"

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <div>Compteur : {count}</div>
      <Button onClick={() => setCount(c => c + 1)}>Incrémenter</Button>
    </div>
  )
}