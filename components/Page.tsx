import { Metadata } from "next";
import { onlyText } from "react-children-utilities";
import { formatDate } from "@/lib/formatDate";
import siteConfig from "@/data/siteConfig";
import { Prose } from "@/components/Prose";
import { cx } from "@/lib/utils";

interface PageProps {
  date?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  thumbnail?: string;
  children?: React.ReactNode;
}
export const generateMetadata = ({ params }: { params: PageProps }): Metadata => {
  const metaTitle = onlyText(params.title);
  const metaDescription = params.description
    ? onlyText(params.description)
    : siteConfig.siteDescription;
  const metaThumbnail = params.thumbnail ? params.thumbnail : siteConfig.siteThumbnail;
  const customTitle = `${metaTitle} - ${siteConfig.siteName}`;

  return {
    title: customTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      images: [`${siteConfig.siteUrl}${metaThumbnail}`],
    },
  };
};

export const Page: React.FC<PageProps> = ({
  date,
  title,
  description,
  children,
}) => {
  return (
    <>
      <header className={cx("mb-10 pb-4", "border-red-pale", "dark:border-yellow")}>
        <h1 className={cx("font-bold text-6xl", "text-red-pale", "dark:text-yellow")}>
          {title}
        </h1>
        {date ? (
          <time className={cx("block mb-0 py-2", "text-gray-500", "dark:text-gray-400")}>
            {"∟ "}{formatDate(date)}
          </time>
        ) : null}
        {description ? (
          <div className="mt-4">
            <Prose>
              {typeof description === "string" ? (<p>{description}</p>) : (description)}
            </Prose>
          </div>
        ) : null}
      </header>
      {children}
    </>
  );
}
