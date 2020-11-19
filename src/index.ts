// eslint-disable-next-line import/no-unresolved
import { Plugin, Transaction } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import {
  ImagePluginAction,
  ImagePluginSettings,
  ImagePluginState,
} from "./types";
import {
  dataURLtoBlob,
  createPlaceholder,
  defaultUploadFile,
  imagePluginKey,
  startImageUpload,
} from "./utils";

export const insertLatexNode = (a: any) => console.log;

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
    },
  });
};
