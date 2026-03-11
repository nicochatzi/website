import Link from "next/link";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface TreeListInfo {
  url: string;
  text: string;
  isDir?: boolean;
}

interface TreeListItemProps {
  info: TreeListInfo;
  isLast: boolean;
  onReady: () => void;
}

const TYPING_SPEED_MS = 25;

// U+251C ├, U+2514 └, U+2500 ─ — explicit box-drawing chars for correct monospace rendering
const PREFIX_MID = "\u251C\u2500\u2500 ";
const PREFIX_END = "\u2514\u2500\u2500 ";

export const TreeListItem: React.FC<TreeListItemProps> = ({
  info: { url, text, isDir },
  onReady,
  isLast,
}) => {
  const charIndex = useRef(0);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  const [visibleText, setVisibleText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    charIndex.current = 0;
    setVisibleText("");
    setDone(false);

    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if (charIndex.current < text.length) {
        const i = charIndex.current;
        const showCursor = i < text.length - 1;
        setVisibleText(text.slice(0, i + 1) + (showCursor ? "\u2587" : ""));
        charIndex.current += 1;
        timer = setTimeout(tick, TYPING_SPEED_MS);
      } else {
        setDone(true);
        onReadyRef.current();
      }
    };
    timer = setTimeout(tick, TYPING_SPEED_MS);
    return () => clearTimeout(timer);
  }, [text]);

  const content = (
    <span className="flex items-baseline leading-snug select-none text-2xl text-purple hover:text-red-pale dark:text-teal-deep dark:hover:text-yellow transition-colors">
      <span className="whitespace-pre">{isLast ? PREFIX_END : PREFIX_MID}</span>
      <span>
        {visibleText}
        {done && isDir && <span className="opacity-60">/</span>}
      </span>
    </span>
  );

  return (
    <li>
      {url ? (
        <Link href={url} itemProp="url" className="block">
          {content}
        </Link>
      ) : (
        content
      )}
    </li>
  );
};

export interface TreeListProps {
  items: TreeListInfo[];
}

export const TreeList: React.FC<TreeListProps> = ({ items }) => {
  const [visibleCount, setVisibleCount] = useState(1);
  const visibleItems = items.slice(0, visibleCount);
  const showNext = () => setVisibleCount((c) => Math.min(c + 1, items.length));

  return (
    <div>
      <div className="text-2xl text-purple dark:text-teal-deep leading-snug">
        .
      </div>
      <ul>
        {visibleItems.map((item, i) => (
          <TreeListItem
            key={item.text}
            info={item}
            isLast={i === visibleItems.length - 1}
            onReady={showNext}
          />
        ))}
      </ul>
    </div>
  );
};
