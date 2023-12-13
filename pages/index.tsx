import type { NextPage } from "next";
import { Page } from "@/components/Page";
import { TreeList } from "@/components/TreeList";

const Home: NextPage = () => {
  return (
    <>
      <Page
        title="htz"
        description={""}
      >
        <TreeList
          items={[
            {
              url: '/blog',
              text: 'blog/',
              depth: 0,
            },
            {
              url: '/about',
              text: 'about.md',
              depth: 0,
              isLast: true,
            },
          ]}
        />
      </Page >
    </>
  );
};

export default Home;
