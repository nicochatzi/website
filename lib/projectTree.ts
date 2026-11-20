import assert from "node:assert/strict";
import { serialize } from "next-mdx-remote/serialize";
import type { TreeItem } from "@/components/TreeList";
import { getMdxContent } from "./mdx";

interface MdxNode {
  type: string;
  name?: string;
  children?: MdxNode[];
  attributes?: { name?: string; value?: unknown }[];
}

function projectItems(nodes: MdxNode[]): TreeItem[] {
  const items: TreeItem[] = [];
  for (const node of nodes) {
    if (node.type !== "mdxJsxFlowElement") continue;
    if (node.name !== "ProjectFolder" && node.name !== "ProjectEntry") continue;
    const title = node.attributes?.find((attr) => attr.name === "title")?.value;
    assert(typeof title === "string", `Missing ${node.name} title`);
    if (node.name === "ProjectFolder") {
      items.push({
        text: `${title}/`,
        children: projectItems(node.children ?? []),
      });
    } else {
      const id = node.attributes?.find((attr) => attr.name === "id")?.value;
      assert(typeof id === "string", `Missing project ID for ${title}`);
      items.push({ text: title, url: `/projects#${id}` });
    }
  }
  return items;
}

export async function getProjectTree() {
  let items: TreeItem[] = [];
  const { content } = getMdxContent("projects.mdx");
  await serialize(content, {
    mdxOptions: {
      remarkPlugins: [
        () => (root: MdxNode) => {
          items = projectItems(root.children ?? []);
        },
      ],
    },
  });
  return items;
}
