import type { NextPage } from "next";
import { Page } from "@/components/Page";
import { Prose } from "@/components/Prose";
import { GitHub, Linkedin } from "react-feather";
import siteConfig from "@/data/siteConfig";
import { cx } from "@/lib/utils";
import Socials from "@/components/Socials";

const iconProps = { className: "w-4 h-4" };

const SOCIAL_ICONS: { [key: string]: React.ReactNode } = {
  github: <GitHub {...iconProps} />,
  linkedin: <Linkedin {...iconProps} />,
};

const About: NextPage = () => {
  return (
    <>
      <Page
        title="about"
      >
        <div className="mt-auto py-2" />
        <Prose>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam sed
            aliquam tempora nihil magni natus mollitia. Doloribus,
            exercitationem iusto odio asperiores dolor, alias excepturi maxime
            distinctio quod eum saepe eos!
          </p>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam sed
            aliquam tempora nihil magni natus mollitia. Doloribus,
            exercitationem iusto odio asperiores dolor, alias excepturi maxime
            distinctio quod eum saepe eos!
          </p>
        </Prose>
        <Socials />
      </Page>
    </>
  );
};

export default About;
