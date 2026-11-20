import Link from "next/link";
import type { CSSProperties } from "react";

export type TreeItem =
  | { text: string; url: string }
  | { text: string; children: TreeItem[] };

const CHARACTER_MS = 35;
const ROW_PAUSE_MS = 60;

function TreeRows({ items }: { items: TreeItem[] }) {
  let delay = 100;

  return (
    <ul>
      {items.map((item) => {
        const characters = Array.from(item.text);
        const style = { "--row-delay": `${delay}ms` } as CSSProperties;
        delay += characters.length * CHARACTER_MS + ROW_PAUSE_MS;
        const label = (
          <span aria-hidden="true" className="min-w-0 wrap-anywhere">
            {characters.map((character, index) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: Character positions are fixed within each keyed label.
                key={index}
                className="tree-character"
                style={{
                  animationDelay: `calc(var(--row-delay) + ${index * CHARACTER_MS}ms)`,
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
                <TreeRows items={item.children} />
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

export function TreeList({ items }: { items: TreeItem[] }) {
  return (
    <div className="directory-tree text-2xl leading-snug text-link">
      <div aria-hidden="true">.</div>
      <TreeRows items={items} />
    </div>
  );
}
