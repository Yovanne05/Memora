import { TagInput } from "@/components/ui/tag-input"

type TagsFilterProps = {
  id: string
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagsFilter({ id, tags, onChange }: Readonly<TagsFilterProps>) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium">
        Filtrer par tags
      </label>
      <TagInput
        id={id}
        value={tags}
        onChange={onChange}
        placeholder="Ajouter un tag..."
        maxTags={10}
      />
    </div>
  )
}
