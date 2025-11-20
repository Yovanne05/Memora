import { render, screen, fireEvent } from "@testing-library/react"
import App from "./App"

describe("App component", () => {
  test("affiche le compteur et incrémente", () => {
    render(<App />)

    expect(screen.getByText(/Compteur : 0/i)).toBeInTheDocument()

    const button = screen.getByRole("button", { name: /Incrémenter/i })

    fireEvent.click(button)

    expect(screen.getByText(/Compteur : 1/i)).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByText(/Compteur : 2/i)).toBeInTheDocument()
  })
})
