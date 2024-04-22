import type { NextPage } from "next";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import Socials from "@/components/Socials";
import dynamic from 'next/dynamic';

const AboutContent = dynamic(() => import('../content/about.mdx'));

const About: NextPage = () => {
  return (
    <>
      <Page
        title="about"
      >
        <div className="mt-auto py-2" />
        <Prose>
          <AboutContent />
        </Prose>
        <Socials />
      </Page>
    </>
  );
};

export default About;
