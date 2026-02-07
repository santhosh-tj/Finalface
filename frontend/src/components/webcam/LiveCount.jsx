export function LiveCount({ present, total, recent }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-2">
      <h3 className="font-semibold text-gray-800">Live Count</h3>
      <p className="text-2xl font-bold text-primary-600">
        <span className="text-green-600">{present}</span>
        <span className="text-gray-400"> / </span>
        <span>{total ?? "—"}</span>
      </p>
      <p className="text-sm text-gray-500">Present / Total</p>
      {recent?.length > 0 && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs font-medium text-gray-500 mb-1">Recent</p>
          <ul className="text-sm text-gray-700 space-y-0.5">
            {recent.slice(0, 5).map((r, i) => (
              <li key={i}>{r.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
