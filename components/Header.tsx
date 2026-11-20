import Link from "next/link";
import { useRouter } from "next/router";
import siteConfig from "@/data/siteConfig";
import { ThemeSelect } from "./ThemeSelect";

export const Header: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <header className="relative py-7 sm:flex sm:items-center sm:justify-between sm:py-12">
      <nav aria-label="Main navigation">
        <ul className="grid grid-cols-[max-content_max-content] items-center gap-x-3 gap-y-2 text-sm min-[380px]:flex min-[380px]:flex-wrap min-[480px]:gap-x-5 min-[480px]:text-base sm:gap-x-8">
          {siteConfig.nav.map(({ label, href }) => {
            const current =
              pathname === href
                ? "page"
                : pathname.startsWith(`${href}/`)
                  ? "location"
                  : undefined;
            return (
              <li
                key={href}
                className="first:col-span-full first:basis-full sm:first:basis-auto"
              >
                <Link
                  href={href}
                  aria-current={current}
                  className="inline-flex min-h-8 items-center text-muted hover:text-link aria-[current]:text-link aria-[current]:font-bold"
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="absolute top-7 right-0 sm:static">
        <ThemeSelect />
      </div>
    </header>
  );
};
