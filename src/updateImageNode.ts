import { Node, Schema } from "prosemirror-model";
import { defaultExtraAttributes } from "./defaults";

const updateImageNode = (
  nodes: Schema["spec"]["nodes"],
  // Additional attributes where the keys are attribute names and values are default values
  extraAttributes: Record<string, string | null> = defaultExtraAttributes,
  hasTitle = true
): typeof nodes => {
  const attributesUpdate = Object.keys(extraAttributes)
    .map((attrKey) => ({
      [attrKey]: {
        default: extraAttributes[attrKey] || null,
      },
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const attributeKeys = [...Object.keys(extraAttributes), "src", "alt"];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return nodes.update("image", {
    ...(hasTitle ? { content: "inline*" } : {}),
    attrs: {
      src: { default: null },
      alt: { default: null },
      ...attributesUpdate,
    },
    group: "block",
    atom: true,
    draggable: true,
    toDOM(node: Node) {
      const toAttributes = attributeKeys
        .map((attrKey) => ({ [`imageplugin-${attrKey}`]: node.attrs[attrKey] }))
        // merge
        .reduce((acc, curr) => ({ ...acc, ...curr }), {});
      return [
        "div",
        {
          class: `imagePluginRoot`,
          ...toAttributes,
        },
        0,
      ];
    },
    parseDOM: [
      {
        tag: "div.imagePluginRoot",
        getAttrs(dom: HTMLElement) {
          return (
            attributeKeys
              .map((attrKey) => ({
                [attrKey]: dom.getAttribute(`imageplugin-${attrKey}`),
              }))
              // merge
              .reduce((acc, curr) => ({ ...acc, ...curr }), {})
          );
        },
      },
    ],
  });
};

export default updateImageNode;
