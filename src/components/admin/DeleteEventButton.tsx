"use client";

import { Trash2 } from "lucide-react";

export default function DeleteEventButton({ action }: { action: () => void }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Excluir este evento? Esta ação não pode ser desfeita.")) e.preventDefault();
      }}
    >
      <button className="asb-btn" type="submit" style={{ padding: "5px 8px" }} aria-label="Excluir evento">
        <Trash2 size={12} />
      </button>
    </form>
  );
}
