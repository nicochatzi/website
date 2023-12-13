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
            { url: '/blog', text: 'blog/' },
            { url: '/feed.xml', text: 'rss.xml' },
            { url: '/about', text: 'about.md' },
          ]}
        />
      </Page >
    </>
  );
};

export default Home;
