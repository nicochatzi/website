import type { NextPage } from "next";
import { Page } from "@/components/Page";
import { TreeList } from "@/components/TreeList";

const Home: NextPage = () => {
  return (
    <>
      <Page
        title="htz"
      >
        <TreeList
          items={[
            { url: '/posts', text: 'posts/' },
            { url: '/projects', text: 'projects.md' },
            { url: '/about', text: 'about.md' },
            { url: '/rss.xml', text: 'rss.xml' },
          ]}
        />
      </Page >
    </>
  );
};

export default Home;
