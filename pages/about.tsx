import type { GetStaticProps, NextPage } from "next";
import { MDX } from "@/components/MDX";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import Socials from "@/components/Socials";
import { type MdxProps, makeGetMdxStaticProps } from "@/lib/mdx";

const About: NextPage<MdxProps> = ({ frontMatter, mdx }) => {
  return (
    <Page {...frontMatter}>
      <div className="mt-auto py-2" />
      <Prose>
        <MDX mdx={mdx} />
      </Prose>
      <Socials />
    </Page>
  );
};

export const getStaticProps: GetStaticProps =
  makeGetMdxStaticProps("about.mdx");

export default About;
