"use client";

/**
 * Page backdrop.
 *
 * Was: a grid-paper texture, a cursor-tracking spotlight, three infinitely
 * drifting gradient orbs and a film-grain overlay. HIG "Motion" ("don't add
 * motion for the sake of adding motion") and "Accessibility" ("be cautious with
 * fast-moving animations… reduce peripheral motion") both point the other way,
 * and none of it survived the switch to a neutral surface palette.
 *
 * Now: one static, very low-contrast wash that keeps the page from reading as a
 * flat slab, and nothing that moves. No client state, no listeners — but the
 * file stays a component so `page.tsx` is unchanged.
 */
export default function GridBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-void">
      {/* A single cool highlight behind the hero, at the threshold of visibility. */}
      <div
        className="absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% 0%, hsl(var(--brand-primary) / 0.07) 0%, transparent 62%)",
        }}
      />
      {/* Section bands fade back into the base colour toward the fold. */}
      <div className="absolute inset-x-0 top-[60vh] h-[40vh] bg-gradient-to-b from-transparent to-void" />
    </div>
  );
}
