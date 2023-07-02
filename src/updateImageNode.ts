import { Node, Schema } from "prosemirror-model";
import { ImagePluginSettings } from "./types";

interface IDomAttributes {
  src: string | null;
  alt: string | null;
  align: string;
  'padding-top': string | null;
  'padding-right': string | null;
  'padding-bottom': string | null;
  'padding-left': string | null;
  width: number | null;
  height: number | null;
}

const updateImageNode = (
  nodes: Schema["spec"]["nodes"],
  // Additional attributes where the keys are attribute names and values are default values
  pluginSettings: ImagePluginSettings
): typeof nodes => {
  const { extraAttributes } = pluginSettings;
  const attributesUpdate = Object.keys(extraAttributes)
    .map((attrKey) => ({
      [attrKey]: {
        default: extraAttributes[attrKey] || null,
      },
    }))
    .reduce((acc, curr) => ({ ...acc, ...curr }), {});

  const attributeKeys = [...Object.keys(extraAttributes), "src", "alt", "padding-left", "padding-right", "padding-top", "padding-bottom"];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return nodes.update("image", {
    ...(pluginSettings.hasTitle ? { content: "inline*" } : {}),
    attrs: {
      src: { default: null },
      alt: { default: null },
      height: { default: null },
      width: { default: null },
      maxWidth: { default: null },
      "padding-left": { default: null },
      "padding-right": { default: null },
      "padding-top": { default: null },
      "padding-bottom": { default: null },
      ...attributesUpdate,
    },
    atom: true,
    ...(pluginSettings.isBlock
      ? { group: "block" }
      : { group: "inline", inline: true }),
    draggable: true,
    toDOM(node: Node) {
      const paddingTop = node.attrs["padding-top"];
      const paddingRight = node.attrs["padding-right"];
      const paddingBottom = node.attrs["padding-bottom"];
      const paddingLeft = node.attrs["padding-left"];

      let align = node.attrs.align || "left";

      let widthStyle = `width: ${
        node.attrs.width ? `${node.attrs.width}px` : "auto"
      }; height: ${node.attrs.height ? `${node.attrs.height}px` : "auto"};`;

      let floatStyle = `float: left; margin: ${paddingTop || "16px"} ${
        paddingRight || "32px"
      } ${paddingBottom || "0px"} ${paddingLeft || "0px"}; ${widthStyle}`; // default for left
      if (align === "center") {
        floatStyle = `float: none; margin: 0 auto; ${widthStyle}`;
      } else if (align === "right") {
        floatStyle = `float: right; margin: ${paddingTop || "0"} ${
          paddingRight || "0"
        } ${paddingBottom || "0"} ${paddingLeft || "0"}; ${widthStyle}`;
      }

      return [
        "img",
        {
          src: node.attrs.src,
          alt: node.attrs.alt,
          style: floatStyle,
        },
      ];
    },
    parseDOM: [
      {
        tag: "img",
        getAttrs(dom) {
          if (typeof dom === "string") return {};
          let result: IDomAttributes = {
            src: null,
            alt: null,
            align: "left",
            'padding-top': "",
            'padding-right': "",
            'padding-bottom': "",
            'padding-left': "",
            width: null,
            height: null
          };

          let align = "left"; // default
          if (dom.style.float === "none") {
            align = "center";
          } else if (dom.style.float === "right") {
            align = "right";
          }

          let pxRegex = /^(?!0*px$)[1-9][0-9]*px$/; // match 123px or 1px but not 0px (a 0px value should be ignored)

          result["src"] = dom.getAttribute("src");
          result["alt"] = dom.getAttribute("alt");
          result["align"] = align;
          result["padding-top"] = pxRegex.test(dom.style.marginTop) ? dom.style.marginTop : null;
          result["padding-right"] = pxRegex.test(dom.style.marginRight) ? dom.style.marginRight : null;
          result["padding-bottom"] = pxRegex.test(dom.style.marginBottom) ? dom.style.marginBottom : null;
          result["padding-left"] = pxRegex.test(dom.style.marginLeft) ? dom.style.marginLeft : null;
          result["width"] =
            dom.style.width === "auto" ? null : parseInt(dom.style.width);
          result["height"] =
            dom.style.height === "auto" ? null : parseInt(dom.style.height);
          return result;
        },
      },
    ],
  });
};

export default updateImageNode;
