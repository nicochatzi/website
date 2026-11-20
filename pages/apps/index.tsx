import { Page } from "@/components/Page";
import { TreeList } from "@/components/TreeList";
import { apps } from "@/data/apps";

export default function AppsPage() {
  return (
    <Page title="apps">
      <TreeList
        items={apps.map(({ slug }) => ({
          url: `/apps/${slug}`,
          text: `${slug}.wasm`,
        }))}
      />
    </Page>
  );
}
