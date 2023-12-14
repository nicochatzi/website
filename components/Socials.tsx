import type { NextPage } from "next";
import { GitHub, Linkedin } from "react-feather";
import siteConfig from "@/data/siteConfig";
import { cx } from "@/lib/utils";

const iconProps = { className: "w-4 h-4" };

const SOCIAL_ICONS: { [key: string]: React.ReactNode } = {
  github: <GitHub {...iconProps} />,
  linkedin: <Linkedin {...iconProps} />,
};

const Socials: NextPage = () => (
  <div className="mt-auto py-12">
    {siteConfig.social ? (
      <ul className="flex justify-center space-x-4">
        {Object.entries(siteConfig.social).map(([key, href]) => {
          return (
            <li key={key}>
              <a
                href={href}
                className={cx(
                  "w-8 h-8 grid place-items-center rounded-md",
                  "bg-gray-200 text-gray-900 hover:bg-gray-800 hover:text-gray-100",
                  "dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-200  dark:hover:text-gray-950",
                )}
                title={key}
              >
                {SOCIAL_ICONS[key]}
              </a>
            </li>
          );
        })}
      </ul>
    ) : null}
  </div>
);

export default Socials;

