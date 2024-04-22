import type { GetStaticProps, NextPage } from "next";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import Socials from "@/components/Socials";
import { MdxProps, makeGetMdxStaticProps } from "@/lib/mdx";
import { MDX } from "@/components/MDX";

const Project: NextPage<MdxProps> = ({ frontMatter, mdx }) => {
  return (
    <>
      <Page
        {...frontMatter}
      >
        <div className="mt-auto py-2" />
        <Prose>
          <MDX mdx={mdx} />
        </Prose>
        <Socials />
      </Page>
    </>
  );
};

export const getStaticProps: GetStaticProps = makeGetMdxStaticProps('projects.mdx');

export default Project;
