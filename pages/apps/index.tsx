import { Page } from "@/components/Page";
import { TreeList } from "@/components/TreeList";
import { appLinks } from "@/data/apps";

export default function AppsPage() {
  return (
    <Page title="apps">
      <TreeList items={appLinks} />
    </Page>
  );
}
