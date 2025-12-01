interface LegendItem {
  color: string;
  label: string;
}

const LEGEND_ITEMS: LegendItem[] = [
  { color: "bg-blue-600", label: "3+ connexions" },
  { color: "bg-blue-400", label: "2-3 connexions" },
  { color: "bg-blue-200", label: "0-1 connexion" },
];

export function VisualizationLegend() {
  return (
    <div className="border-t bg-background px-4 py-2">
      <div className="flex items-center gap-4 text-xs">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${item.color}`} />
            <span className="text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
