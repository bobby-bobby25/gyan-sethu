export function ColorLegend() {
  return (
    <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
      <span className="font-medium">Legend:</span>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-success"></span>
        <span>Good</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-warning"></span>
        <span>Attention</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-destructive"></span>
        <span>Critical</span>
      </div>
    </div>
  );
}
