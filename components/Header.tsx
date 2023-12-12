import { useRouter } from "next/router";
import siteConfig from "@/data/siteConfig";
import Link from "next/link";
import { cx } from "@/lib/utils";
import { ThemeSelect } from "./ThemeSelect";

export const Header: React.FC = () => {
  const { pathname } = useRouter();
  return (
    <header className="py-12 flex justify-between items-end">
      <nav>
        <ul className="flex space-x-8">
          {siteConfig.nav.map((item, index) => {
            const isActive = item.href === pathname;
            return (
              <li key={index}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cx(
                    "text-gray-500 hover:text-gray-900",
                    "dark:text-gray-400 dark:hover:text-gray-200"
                  )}
                >
                  /{item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-8 flex">
        <ThemeSelect />
      </div>
    </header>
  );
};
