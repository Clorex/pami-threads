export function SizeGuide({ collectionKey }: { collectionKey: string }) {
  const key = (collectionKey || "").toLowerCase();

  // Simple, safe defaults. You can refine later.
  const guides: Record<string, { title: string; lines: string[] }> = {
    ankara: {
      title: "Size guide (Ankara)",
      lines: ["Unisex fit.", "If you prefer a looser fit, choose one size up."],
    },
    adire: {
      title: "Size guide (Adire)",
      lines: ["Unisex fit.", "If you are between sizes, choose the bigger size."],
    },
    linen: {
      title: "Size guide (Linen)",
      lines: ["Comfort fit.", "Linen has little stretch—consider sizing up for relaxed wear."],
    },
    asooke: {
      title: "Size guide (Asooke)",
      lines: ["Structured feel.", "If you want extra comfort, choose one size up."],
    },
    polo: {
      title: "Size guide (Polo)",
      lines: ["Regular fit.", "Choose your usual size for a clean look."],
    },
    default: {
      title: "Size guide",
      lines: ["Unisex fit.", "If unsure, choose the bigger size for a relaxed fit."],
    },
  };

  const picked =
    key.includes("ankara") ? guides.ankara :
    key.includes("adire") ? guides.adire :
    key.includes("linen") ? guides.linen :
    key.includes("asooke") ? guides.asooke :
    key.includes("polo") ? guides.polo :
    guides.default;

  return (
    <div className="rounded-2xl border bg-white p-5">
      <div className="text-sm font-semibold">{picked.title}</div>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-gray-600">
        {picked.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}