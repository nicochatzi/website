// // https://github.com/microsoft/TypeScript/pull/33050

// type Branch<T> = T | T[] | undefined;
// interface Node extends Branch<Node> {}
// type Tree = Node;

// const create = () => {
//   const tree: Tree = [];
// };
