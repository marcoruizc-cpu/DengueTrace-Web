interface Point {
  label: string;
  count: number;
}

export function CaseChart({ points }: { points: Point[] }) {
  const maximum = Math.max(1, ...points.map(point => point.count));

  return (
    <ul className="space-y-2">
      {points.map(({ label, count }, index) => (
        <li key={`${label}-${index}`} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-2 text-sm">
          <span>{label}</span>
          <span aria-hidden className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <span className="block h-full rounded-full bg-sky-700 dark:bg-sky-400" style={{ width: `${count / maximum * 100}%` }} />
          </span>
          <span className="text-right tabular-nums">{count.toLocaleString('es-PE')}</span>
        </li>
      ))}
    </ul>
  );
}
