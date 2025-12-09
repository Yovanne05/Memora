import React from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import { CollectionsToolbar } from "@/features/collections/components/list/CollectionsToolbar"
import { CollectionCollaboratorsSection } from "@/features/collections/components/details/CollectionCollaboratorsSection"
import { CollectionNotesHeader } from "@/features/collections/components/details/CollectionNotesHeader"

vi.mock("@/components/ui/form-select", () => ({
  FormSelect: ({ value, onValueChange, options, id, label }: any) => (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <select
        data-testid={id ?? "form-select"}
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        <option value="">--</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
}))

vi.mock("@/components/ui/select", () => {
  const SelectItem = ({ value, children }: any) => <option value={value}>{children}</option>

  const Select = ({ value, onValueChange, children }: any) => {
    const flatten = (nodes: any): any[] =>
      React.Children.toArray(nodes).flatMap((node: any) => {
        if (node?.type === "option") return node
        if (node?.props?.value !== undefined) {
          return <option value={node.props.value}>{node.props.children}</option>
        }
        if (node?.props?.children) return flatten(node.props.children)
        return []
      })

    const options = flatten(children)

    return (
      <select
        data-testid="select-mock"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
      >
        {options}
      </select>
    )
  }

  return {
    Select,
    SelectTrigger: ({ children }: any) => <>{children}</>,
    SelectValue: () => null,
    SelectContent: ({ children }: any) => <>{children}</>,
    SelectItem,
  }
})

describe("Composants supplémentaires des collections", () => {
  test("CollectionsToolbar affiche les filtres et permet de réinitialiser", async () => {
    const onVisibilityFilterChange = vi.fn()
    render(
      <CollectionsToolbar
        search=""
        onSearchChange={vi.fn()}
        tab="mine"
        onTabChange={vi.fn()}
        sort="recent"
        onSortChange={vi.fn()}
        visibilityFilter="public"
        onVisibilityFilterChange={onVisibilityFilterChange}
        showFilters
        onToggleFilters={vi.fn()}
      />
    )

    expect(screen.getByText("1")).toBeInTheDocument()
    await userEvent.click(screen.getByText(/initialiser/i))
    expect(onVisibilityFilterChange).toHaveBeenCalledWith(undefined)
  })

  test("CollectionCollaboratorsSection affiche le message informatif", () => {
    render(<CollectionCollaboratorsSection />)
    expect(screen.getByText(/Collaborateurs/)).toBeInTheDocument()
    expect(screen.getByText(/Collection/)).toBeInTheDocument()
  })

  test("CollectionNotesHeader déclenche les callbacks", async () => {
    const onSelectNote = vi.fn()
    const onSearchChange = vi.fn()
    const onSortChange = vi.fn()

    render(
      <CollectionNotesHeader
        availableNotes={[{ id: "1", title: "Note 1" }]}
        selected=""
        isAdding={false}
        onSelectNote={onSelectNote}
        searchValue=""
        onSearchChange={onSearchChange}
        sortValue="recent"
        onSortChange={onSortChange}
      />
    )

    await userEvent.type(screen.getByLabelText(/Rechercher/), "abc")
    expect(onSearchChange).toHaveBeenCalled()

    await userEvent.selectOptions(screen.getByTestId("add-note"), "1")
    expect(onSelectNote).toHaveBeenCalledWith("1")

    await userEvent.selectOptions(screen.getByTestId("select-mock"), "alphabetical")
    expect(onSortChange).toHaveBeenCalledWith("alphabetical")
  })
})
