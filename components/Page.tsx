import type { Metadata } from "next";
import { onlyText } from "react-children-utilities";
import { Prose } from "@/components/Prose";
import siteConfig from "@/data/siteConfig";
import { formatDate } from "@/lib/formatDate";

interface PageProps {
  date?: string;
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  thumbnail?: string;
  children?: React.ReactNode;
}
export const generateMetadata = ({
  params,
}: {
  params: PageProps;
}): Metadata => {
  const metaTitle = onlyText(params.title);
  const metaDescription = params.description
    ? onlyText(params.description)
    : siteConfig.siteDescription;
  const metaThumbnail = params.thumbnail
    ? params.thumbnail
    : siteConfig.siteThumbnail;
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
      <header className="mb-6 sm:mb-10">
        <h1 className="text-[clamp(2.25rem,calc(1.5rem+4.5vw),3.75rem)] leading-[1.1] font-bold wrap-anywhere text-heading">
          {title}
        </h1>
        {date ? (
          <time dateTime={date} className="block py-2 text-muted">
            {"∟ "}
            {formatDate(date)}
          </time>
        ) : null}
        {description ? (
          <div className="mt-4">
            <Prose>
              {typeof description === "string" ? (
                <p>{description}</p>
              ) : (
                description
              )}
            </Prose>
          </div>
        ) : null}
      </header>
      {children}
    </>
  );
};
