import Link from "next/link";
import { useRouter } from "next/router";
import { ThemeSelect } from "./ThemeSelect";

export const Header: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <header className="flex items-center justify-between py-7 sm:py-12">
      <Link
        href="/"
        aria-label="Home"
        title="Home"
        aria-current={pathname === "/" ? "page" : undefined}
        className="inline-flex min-h-11 min-w-11 items-center text-muted hover:text-link aria-[current]:font-bold aria-[current]:text-link"
      >
        ~/
      </Link>
      <ThemeSelect />
    </header>
  );
};
