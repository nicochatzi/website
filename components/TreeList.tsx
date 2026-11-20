import Link from "next/link";

interface TreeLink {
  url: string;
  text: string;
}

const CHARACTER_MS = 25;

export function TreeList({ items }: { items: TreeLink[] }) {
  let delay = 0;

  return (
    <div className="text-2xl leading-snug text-link">
      <div aria-hidden="true">.</div>
      <ul>
        {items.map(({ url, text }, index) => {
          const duration = text.length * CHARACTER_MS;
          const start = delay;
          delay += duration;
          return (
            <li key={url}>
              <Link
                href={url}
                className="tree-link inline-flex hover:text-heading"
                style={{ animationDelay: `${start}ms` }}
              >
                <span aria-hidden="true" className="whitespace-pre">
                  {index === items.length - 1 ? "└── " : "├── "}
                </span>
                <span
                  className="tree-label"
                  style={{
                    animationDuration: `${duration}ms`,
                    animationTimingFunction: `steps(${text.length}, end)`,
                  }}
                >
                  {text}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
