"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PgShell, PgPanel, PgButton, PgSelect, PgSlider, PgToggle, ScenarioBar, PgNote } from "./ui";

// ---------------------------------------------------------------------------
// The real service calls Gemini via LangChain to generate an itinerary for
// *any* destination. That can't run client-side, so this is a small, honest,
// rule/template-based illustrative preview: a bundled activity bank for five
// destinations, genuinely assembled into a day-by-day plan that changes with
// the exact destination, day count, and interest tags you pick below.
// ---------------------------------------------------------------------------

type Interest = "beach" | "culture" | "food" | "adventure";
type TimeOfDay = "Morning" | "Afternoon" | "Evening";

interface ActivityDef {
  activity: string;
  tags: Interest[];
}

type ActivityBank = Record<TimeOfDay, ActivityDef[]>;

const DESTINATIONS: Record<string, ActivityBank> = {
  Goa: {
    Morning: [
      { activity: "Sunrise walk along Baga Beach", tags: ["beach"] },
      { activity: "Yoga session on Anjuna Beach", tags: ["beach", "adventure"] },
      { activity: "Visit the spice plantations near Ponda", tags: ["culture", "food"] },
      { activity: "Explore the Basilica of Bom Jesus in Old Goa", tags: ["culture"] },
      { activity: "Fresh-catch breakfast at a beach shack", tags: ["food", "beach"] },
      { activity: "Kayaking through the Chapora backwaters", tags: ["adventure"] },
    ],
    Afternoon: [
      { activity: "Water sports at Baga Beach (parasailing, jet-ski)", tags: ["adventure", "beach"] },
      { activity: "Lunch thali at a local Goan restaurant", tags: ["food"] },
      { activity: "Wander the Latin Quarter of Fontainhas", tags: ["culture"] },
      { activity: "Scuba diving trip off Grande Island", tags: ["adventure", "beach"] },
      { activity: "Cashew feni tasting tour", tags: ["food", "culture"] },
      { activity: "Relax by the pool at a beach resort", tags: ["beach"] },
    ],
    Evening: [
      { activity: "Sunset at the Vagator Beach cliffs", tags: ["beach"] },
      { activity: "Night market shopping in Anjuna", tags: ["culture", "food"] },
      { activity: "Seafood dinner at a Candolim beach shack", tags: ["food", "beach"] },
      { activity: "Live music at a Baga Beach bar", tags: ["culture"] },
      { activity: "Sunset river cruise on the Mandovi", tags: ["beach", "adventure"] },
    ],
  },
  Paris: {
    Morning: [
      { activity: "Croissants and coffee at a local boulangerie", tags: ["food"] },
      { activity: "Climb the Eiffel Tower at opening hour", tags: ["culture"] },
      { activity: "Explore the Louvre's Egyptian and Renaissance wings", tags: ["culture"] },
      { activity: "Stroll through the Luxembourg Gardens", tags: ["culture", "adventure"] },
      { activity: "Montmartre walking tour and Sacré-Cœur", tags: ["culture"] },
    ],
    Afternoon: [
      { activity: "Seine river cruise past Notre-Dame", tags: ["culture"] },
      { activity: "Cheese and wine tasting in Le Marais", tags: ["food"] },
      { activity: "Musée d'Orsay Impressionist galleries", tags: ["culture"] },
      { activity: "Bike tour along the Canal Saint-Martin", tags: ["adventure"] },
      { activity: "Shopping and people-watching on Rue Cler", tags: ["food", "culture"] },
    ],
    Evening: [
      { activity: "Dinner at a classic Left Bank bistro", tags: ["food"] },
      { activity: "Cabaret show at the Moulin Rouge", tags: ["culture"] },
      { activity: "Eiffel Tower light show from Trocadéro", tags: ["culture"] },
      { activity: "Late-night crêpes at a Latin Quarter stand", tags: ["food"] },
      { activity: "Jazz club set in Saint-Germain-des-Prés", tags: ["culture", "adventure"] },
    ],
  },
  Tokyo: {
    Morning: [
      { activity: "Tsukiji Outer Market sushi breakfast", tags: ["food"] },
      { activity: "Explore Senso-ji Temple in Asakusa", tags: ["culture"] },
      { activity: "Sunrise views from Tokyo Skytree", tags: ["culture", "adventure"] },
      { activity: "Meiji Shrine forest walk", tags: ["culture"] },
      { activity: "Ramen tasting crawl in a local shotengai", tags: ["food"] },
    ],
    Afternoon: [
      { activity: "Shibuya Crossing and the Hachiko statue", tags: ["culture"] },
      { activity: "teamLab digital art museum", tags: ["culture", "adventure"] },
      { activity: "Harajuku street food on Takeshita Street", tags: ["food", "culture"] },
      { activity: "Akihabara electronics and anime district", tags: ["culture"] },
      { activity: "Day-trip hike near Mount Takao", tags: ["adventure"] },
    ],
    Evening: [
      { activity: "Izakaya hopping in Shinjuku's Omoide Yokocho", tags: ["food"] },
      { activity: "Karaoke night in Kabukicho", tags: ["culture", "adventure"] },
      { activity: "Neon-lit dinner show in Shinjuku", tags: ["culture"] },
      { activity: "Sunset views from a Shinjuku sky bar", tags: ["culture"] },
      { activity: "Late-night ramen at a standing-room shop", tags: ["food"] },
    ],
  },
  "New York": {
    Morning: [
      { activity: "Bagels and coffee in the West Village", tags: ["food"] },
      { activity: "Walk the High Line at sunrise", tags: ["culture", "adventure"] },
      { activity: "Metropolitan Museum of Art galleries", tags: ["culture"] },
      { activity: "Central Park jogging loop and boathouse", tags: ["adventure"] },
      { activity: "Brooklyn Bridge morning walk", tags: ["culture", "adventure"] },
    ],
    Afternoon: [
      { activity: "MoMA modern art collection", tags: ["culture"] },
      { activity: "Food hall crawl at Chelsea Market", tags: ["food"] },
      { activity: "Top of the Rock observation deck", tags: ["culture"] },
      { activity: "Shopping along Fifth Avenue", tags: ["culture"] },
      { activity: "Kayaking on the Hudson River", tags: ["adventure"] },
    ],
    Evening: [
      { activity: "Broadway show in Times Square", tags: ["culture"] },
      { activity: "Dinner in Little Italy", tags: ["food"] },
      { activity: "Rooftop bar with skyline views", tags: ["culture"] },
      { activity: "Jazz set in a Greenwich Village club", tags: ["culture"] },
      { activity: "Late-night pizza-slice crawl", tags: ["food"] },
    ],
  },
  Bali: {
    Morning: [
      { activity: "Sunrise trek up Mount Batur", tags: ["adventure"] },
      { activity: "Rice-terrace walk in Tegallalang", tags: ["culture", "adventure"] },
      { activity: "Sunrise surf session at Canggu Beach", tags: ["beach", "adventure"] },
      { activity: "Visit the Tanah Lot sea temple", tags: ["culture", "beach"] },
      { activity: "Balinese coffee tasting near Ubud", tags: ["food"] },
    ],
    Afternoon: [
      { activity: "Snorkeling trip off Nusa Penida", tags: ["beach", "adventure"] },
      { activity: "Sacred Monkey Forest Sanctuary in Ubud", tags: ["culture", "adventure"] },
      { activity: "Balinese cooking class", tags: ["food", "culture"] },
      { activity: "Waterfall hike to Tegenungan", tags: ["adventure"] },
      { activity: "Beach-club lounging at Seminyak", tags: ["beach"] },
    ],
    Evening: [
      { activity: "Sunset at the Tanah Lot temple", tags: ["culture", "beach"] },
      { activity: "Kecak fire-dance performance in Uluwatu", tags: ["culture"] },
      { activity: "Seafood dinner on Jimbaran Beach", tags: ["food", "beach"] },
      { activity: "Beachfront bonfire with live music", tags: ["beach"] },
      { activity: "Night-market food stalls in Ubud", tags: ["food", "culture"] },
    ],
  },
};

const TIMES: TimeOfDay[] = ["Morning", "Afternoon", "Evening"];
const INTERESTS: Interest[] = ["beach", "culture", "food", "adventure"];

interface ItineraryDay {
  day: string;
  activities: { time: TimeOfDay; activity: string }[];
}

function generateItinerary(destination: string, days: number, interests: Interest[]): ItineraryDay[] {
  const bank = DESTINATIONS[destination];
  if (!bank) return [];

  const cursors: Record<TimeOfDay, number> = { Morning: 0, Afternoon: 0, Evening: 0 };
  const result: ItineraryDay[] = [];

  for (let d = 1; d <= days; d++) {
    const activities: { time: TimeOfDay; activity: string }[] = [];
    for (const t of TIMES) {
      const pool = bank[t];
      const filtered =
        interests.length > 0 ? pool.filter((a) => a.tags.some((tag) => interests.includes(tag))) : pool;
      const list = filtered.length > 0 ? filtered : pool;
      const idx = cursors[t] % list.length;
      cursors[t] += 1;
      activities.push({ time: t, activity: list[idx].activity });
    }
    result.push({ day: `Day ${d}`, activities });
  }
  return result;
}

export default function TravelAgentPlayground() {
  const [destination, setDestination] = useState("Goa");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryDay[]>(() => generateItinerary("Goa", 3, []));
  const [runId, setRunId] = useState(0);

  function toggleInterest(tag: Interest) {
    setInterests((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  function generate(d: string = destination, n: number = days, i: Interest[] = interests) {
    setItinerary(generateItinerary(d, n, i));
    setRunId((id) => id + 1);
  }

  function scenario(d: string, n: number, i: Interest[]) {
    setDestination(d);
    setDays(n);
    setInterests(i);
    generate(d, n, i);
  }

  return (
    <div className="space-y-5">
      <ScenarioBar
        scenarios={[
          { label: "3-day Goa beach trip", onClick: () => scenario("Goa", 3, ["beach"]) },
          { label: "5-day Tokyo culture & food", onClick: () => scenario("Tokyo", 5, ["culture", "food"]) },
          { label: "Weekend in Paris", onClick: () => scenario("Paris", 2, ["culture"]) },
        ]}
      />

      <PgShell>
        <PgPanel title="Trip preferences">
          <div className="space-y-4">
            <label className="block">
              <div className="mb-1.5 font-mono text-xs text-ink-secondary">Destination</div>
              <PgSelect
                value={destination}
                onChange={(v) => setDestination(v)}
                options={Object.keys(DESTINATIONS).map((d) => ({ value: d, label: d }))}
              />
            </label>
            <PgSlider label="Days" value={days} min={1} max={7} step={1} onChange={setDays} format={(v) => `${v} day${v === 1 ? "" : "s"}`} />
            <div>
              <div className="mb-1.5 font-mono text-xs text-ink-secondary">Interests (biases which activities get picked)</div>
              <div className="grid grid-cols-2 gap-2">
                {INTERESTS.map((tag) => (
                  <PgToggle key={tag} label={tag} checked={interests.includes(tag)} onChange={() => toggleInterest(tag)} />
                ))}
              </div>
            </div>
            <PgButton onClick={() => generate()}>Generate itinerary</PgButton>
          </div>
        </PgPanel>

        <PgPanel title={`Itinerary · ${destination} · ${days} day${days === 1 ? "" : "s"}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={runId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="max-h-[26rem] space-y-3 overflow-y-auto pr-1"
            >
              {itinerary.map((day, i) => (
                <motion.div
                  key={day.day}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className="rounded-lg border border-line-subtle bg-void p-3"
                >
                  <div className="mb-2 font-mono text-xs font-semibold uppercase tracking-wide text-signal-cyan">
                    {day.day}
                  </div>
                  <div className="space-y-1.5">
                    {day.activities.map((a) => (
                      <div key={a.time} className="flex gap-3 font-mono text-xs">
                        <span className="w-16 shrink-0 text-ink-tertiary">{a.time}</span>
                        <span className="text-ink-primary">{a.activity}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </PgPanel>
      </PgShell>

      <PgNote>
        The real backend calls Gemini via LangChain to plan an itinerary for any destination on request. This is a
        client-side illustrative preview using a small bundled activity set for five destinations (Goa, Paris,
        Tokyo, New York, Bali) — the day-by-day shape (<code>{`{ day, activities: [{ time, activity }] }`}</code>)
        matches the real API&apos;s response, but the content is drawn from this bundle, not generated by a model.
      </PgNote>
    </div>
  );
}
