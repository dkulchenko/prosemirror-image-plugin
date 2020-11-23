// eslint-disable-next-line import/no-unresolved
import { Plugin, TextSelection, Transaction } from "prosemirror-state";
import { Node, Schema } from "prosemirror-model";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";

import {
  ImagePluginAction,
  ImagePluginSettings,
  ImagePluginState,
} from "./types";
import {
  createPlaceholder,
  dataURLtoBlob,
  defaultDeleteSrc,
  defaultExtraAttributes,
  defaultUploadFile,
  imagePluginKey,
  startImageUpload,
} from "./utils";

export const insertLatexNode = (a: any) => console.log;

export const updateImageNode = (
  nodes: Schema["spec"]["nodes"],
  // Additional attributes where the keys are attribute names and values are default values
  extraAttributes: Record<string, string | null> = defaultExtraAttributes,
  withTitle = true
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
    ...(withTitle ? { content: "inline*" } : {}),
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
        .map((attrKey) => ({ [`imagePlugin-${attrKey}`]: node.attrs[attrKey] }))
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
                [attrKey]: dom.getAttribute(`imagePlugin-${attrKey}`),
              }))
              // merge
              .reduce((acc, curr) => ({ ...acc, ...curr }), {})
          );
        },
      },
    ],
  });
};

export const addImageToCursor = (
  src: string,
  view: EditorView,
  schema: Schema
) => {
  view.dispatch(
    view.state.tr.insert(
      view.state.selection.from,
      schema.nodes.image.create({ src })
    )
  );
};

export const defaultSettings: ImagePluginSettings = {
  uploadFile: defaultUploadFile,
  hastTitle: true,
  deleteSrc: defaultDeleteSrc,
  extraAttributes: defaultExtraAttributes,
};

export const imagePlugin = <T extends Schema>(
  schema: T,
  settings: Partial<ImagePluginSettings> = {}
): Plugin<ImagePluginState, T> => {
  const pluginSettings = { ...defaultSettings, ...settings };
  return new Plugin({
    key: imagePluginKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr: Transaction<T>, value: DecorationSet<T>): DecorationSet<T> {
        let set = value.map(tr.mapping, tr.doc);
        const action: ImagePluginAction = tr.getMeta(imagePluginKey);
        if (action?.type === "add") {
          const widget = createPlaceholder();
          const deco = Decoration.widget(action.pos, widget, {
            id: action.id,
          });
          set = set.add(tr.doc, [deco]);
        } else if (action?.type === "remove") {
          set = set.remove(
            set.find(undefined, undefined, (spec) => spec.id === action.id)
          );
        }
        return set;
      },
    },
    props: {
      decorations(state) {
        return imagePluginKey.getState(state);
      },
      handleDOMEvents: {
        paste: (view, event) => {
          // Get the data of clipboard
          const clipboardItems = event?.clipboardData?.items;
          if (!clipboardItems) return false;
          const items = Array.from(clipboardItems).filter((item) => {
            // Filter the image items only
            return item.type.indexOf("image") !== -1;
          });
          if (items.length === 0) {
            return false;
          }

          const item = items[0];
          const blob = item.getAsFile();
          if (!blob) {
            return false;
          }
          startImageUpload(view, blob, pluginSettings.uploadFile, schema);
          event.preventDefault();
          return true;
        },
        drop: (view, event) => {
          const textData = event?.dataTransfer?.getData("text/html");
          const file = event?.dataTransfer?.files?.[0];
          const posData = view.posAtCoords({
            top: event.clientY,
            left: event.clientX,
          });
          // The dropped data is HTML content
          if (textData && posData) {
            const container = document.createElement("div");
            container.innerHTML = textData;
            const firstChild = container.children[0];
            if (
              // The dragging comes from ProseMirror, in that case let ProseMirror handle the event.
              !(firstChild instanceof HTMLImageElement) ||
              firstChild.dataset.pmSlice
            ) {
              return false;
            }
            if (
              container.children.length === 1 &&
              firstChild instanceof HTMLImageElement
            ) {
              const blob = dataURLtoBlob(firstChild.src);
              startImageUpload(
                view,
                blob,
                pluginSettings.uploadFile,
                schema,
                posData.pos
              );
            }
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          // The dropped data is image dataURI
          if (file && posData) {
            startImageUpload(
              view,
              file,
              pluginSettings.uploadFile,
              schema,
              posData.pos
            );
            event.preventDefault();
            event.stopPropagation();
            return true;
          }
          return false;
        },
      },
      nodeViews: {
        image: (node, view, getPos, decorations) => {
          const root = document.createElement("div");
          root.className = "imagePluginRoot";
          const image = document.createElement("img");
          image.className = "imagePluginImg";
          const contentDOM = document.createElement("div");
          contentDOM.className = "imagePluginContent";
          root.appendChild(image);
          root.appendChild(contentDOM);

          // Handle image
          image.alt = node.attrs.alt;
          image.src = node.attrs.src;

          // Handle contentDOM
          contentDOM.addEventListener("click", (e) => {
            if (
              !getPos ||
              typeof getPos !== "function" ||
              contentDOM.innerText.length > 1
            ) {
              return;
            }
            e.preventDefault();
            view.dispatch(
              view.state.tr.setSelection(
                TextSelection.near(view.state.doc.resolve(getPos() + 1))
              )
            );
            view.focus();
          });
          contentDOM.className = "text";

          const updateDOM = (updatedNode: Node) => {
            Object.keys(updatedNode.attrs).map((attr) =>
              root.setAttribute(`imagePlugin-${attr}`, updatedNode.attrs[attr])
            );
          };
          updateDOM(node);

          return {
            dom: root,
            contentDOM,
            selectable: true,
            content: "text*",
            update: (updateNode: Node) => {
              updateDOM(updateNode);
              return true;
            },
            stopEvent: (e: Event) => e.target === contentDOM,
            ignoreMutation: () => false,
            destroy: () => {
              pluginSettings.deleteSrc(node.attrs.src);
            },
          };
        },
      },
    },
  });
};
