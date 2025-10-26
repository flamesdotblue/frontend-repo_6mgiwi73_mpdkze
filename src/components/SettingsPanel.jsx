import { useId } from "react";

const PAGE_SIZES = {
  A4: { w: 210, h: 297 },
  Letter: { w: 216, h: 279 },
};

export default function SettingsPanel({ settings, onChange }) {
  const id1 = useId();
  const id2 = useId();
  const id3 = useId();

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="space-y-1">
        <label htmlFor={id1} className="text-sm font-medium text-gray-700">
          Page size
        </label>
        <select
          id={id1}
          className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          value={settings.pageSize}
          onChange={(e) => onChange({ ...settings, pageSize: e.target.value })}
        >
          {Object.keys(PAGE_SIZES).map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor={id2} className="text-sm font-medium text-gray-700">
          Orientation
        </label>
        <select
          id={id2}
          className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          value={settings.orientation}
          onChange={(e) => onChange({ ...settings, orientation: e.target.value })}
        >
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor={id3} className="text-sm font-medium text-gray-700">
          Margin (mm)
        </label>
        <input
          id={id3}
          type="number"
          min={0}
          max={50}
          className="w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
          value={settings.margin}
          onChange={(e) => onChange({ ...settings, margin: Number(e.target.value || 0) })}
        />
      </div>
    </div>
  );
}

export { PAGE_SIZES };
