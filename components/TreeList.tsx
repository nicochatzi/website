import Link from "next/link";
import type { CSSProperties } from "react";

export type TreeItem =
  | { text: string; url: string }
  | { text: string; children: TreeItem[] };

const CHARACTER_MS = 28;
const ROW_PAUSE_MS = 48;

function TreeRows({ items, speed }: { items: TreeItem[]; speed: number }) {
  const characterMs = CHARACTER_MS / speed;
  let delay = 80 / speed;

  return (
    <ul>
      {items.map((item) => {
        const characters = Array.from(item.text);
        const start = delay;
        delay += characters.length * characterMs + ROW_PAUSE_MS / speed;
        const style = {
          "--row-delay": `${start}ms`,
          "--next-row-delay": `${delay}ms`,
        } as CSSProperties;
        const label = (
          <span aria-hidden="true" className="min-w-0 wrap-anywhere">
            {characters.map((character, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: Character positions are fixed within each keyed label.
                key={index}
                className="tree-character"
                style={{
                  animationDelay: `calc(var(--row-delay) + ${index * characterMs}ms)`,
                }}
              >
                {character}
              </span>
            ))}
          </span>
        );
        const row = "tree-link flex w-fit max-w-full hover:text-heading";

        if ("children" in item) {
          return (
            <li key={item.text} style={style}>
              <details>
                <summary className={row} aria-label={item.text}>
                  {label}
                </summary>
                <TreeRows items={item.children} speed={speed} />
              </details>
            </li>
          );
        }
        const Leaf = item.url.includes("#") ? "a" : Link;
        return (
          <li key={item.url} style={style}>
            <Leaf href={item.url} className={row} aria-label={item.text}>
              {label}
            </Leaf>
          </li>
        );
      })}
    </ul>
  );
}

export function TreeList({
  items,
  speed = 1,
}: {
  items: TreeItem[];
  speed?: number;
}) {
  return (
    <div className="directory-tree text-2xl leading-snug text-link">
      <div aria-hidden="true">.</div>
      <TreeRows items={items} speed={speed} />
    </div>
  );
}
