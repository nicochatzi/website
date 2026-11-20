import type { GetStaticProps, NextPage } from "next";
import { MDXRemote } from "next-mdx-remote";
import type { ReactNode } from "react";
import { components } from "@/components/MDX";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import Socials from "@/components/Socials";
import { type MdxProps, makeGetMdxStaticProps } from "@/lib/mdx";

interface BranchProps {
  id: string;
  title: string;
  children: ReactNode;
}

function ProjectFolder({ id, title, children }: BranchProps) {
  return (
    <details open className="project-folder">
      <summary id={id} className="text-xl font-bold">
        {title}/
      </summary>
      <div className="ps-6 sm:ps-8">{children}</div>
    </details>
  );
}

function ProjectEntry({ id, title, children }: BranchProps) {
  return (
    <details className="project-entry">
      <summary className="font-medium">{title}</summary>
      <div id={id} className="mt-3 mb-7 scroll-mt-14 ps-6 sm:ps-8">
        <Prose>{children}</Prose>
      </div>
    </details>
  );
}

const projectComponents = { ...components, ProjectFolder, ProjectEntry };

const Project: NextPage<MdxProps> = ({ frontMatter, mdx }) => (
  <Page {...frontMatter}>
    <div className="project-tree">
      <span aria-hidden="true" className="text-xl text-link">
        .
      </span>
      <MDXRemote {...mdx} components={projectComponents} />
    </div>
    <Socials />
  </Page>
);

export const getStaticProps: GetStaticProps =
  makeGetMdxStaticProps("projects.mdx");

export default Project;
