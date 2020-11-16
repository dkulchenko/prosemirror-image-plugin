// eslint-disable-next-line import/no-unresolved
import { EditorState, Plugin, PluginKey, Transaction } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { Decoration, DecorationSet, EditorView } from "prosemirror-view";
import {
  ImagePluginAction,
  ImagePluginSettings,
  ImagePluginState,
  InsertImagePlaceholder,
  RemoveImagePlaceholder,
} from "./types";

const imagePluginKey = new PluginKey<ImagePluginState>("imagePlugin");

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

export const defaultCreatePlaceholder = (dataURI: string) => {
  const placeholder = document.createElement("div");
  // placeholder.style.display = "inline";
  placeholder.style.width = "50px";
  placeholder.style.height = "50px";
  placeholder.style.backgroundColor = "red";
  return placeholder;
};

export const defaultUploadFile = (dataURI: string): Promise<string> =>
  new Promise((res) => setTimeout(() => res(dataURI), 2000));

const findPlaceholder = (state: EditorState, id: unknown) => {
  const decos = imagePluginKey.getState(state);
  const found = decos?.find(undefined, undefined, (spec) => spec.id === id);
  return found?.length ? found[0].from : undefined;
};

const startImageUpload = (
  view: EditorView,
  file: string,
  uploadFile: (dataURI: string) => Promise<string>,
  schema: Schema,
  pos?: number
) => {
  // A fresh object to act as the ID for this upload
  const id = {};

  // Replace the selection with a placeholder
  const { tr } = view.state;
  if (!tr.selection.empty && !pos) tr.deleteSelection();
  const imageMeta: InsertImagePlaceholder = {
    type: "add",
    pos: pos || tr.selection.from,
    id,
  };
  tr.setMeta(imagePluginKey, imageMeta);
  view.dispatch(tr);

  uploadFile(file).then(
    (url) => {
      const placholderPos = findPlaceholder(view.state, id);
      // If the content around the placeholder has been deleted, drop
      // the image
      if (placholderPos == null) return;
      // Otherwise, insert it at the placeholder's position, and remove
      // the placeholder
      const removeMeta: RemoveImagePlaceholder = { type: "remove", id };
      view.dispatch(
        view.state.tr
          .replaceWith(
            placholderPos,
            placholderPos,
            schema.nodes.image.create({ src: url })
          )
          .setMeta(imagePluginKey, removeMeta)
      );
    },
    () => {
      // On failure, just clean up the placeholder
      view.dispatch(tr.setMeta(imagePluginKey, { remove: { id } }));
    }
  );
};

export const defaultSettings: ImagePluginSettings = {
  createPlaceholder: defaultCreatePlaceholder,
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
          const widget = pluginSettings.createPlaceholder("TODO: DataURI");
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
          const paste = event?.clipboardData?.getData("text");

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
          // Get the blob of image
          const blob = item.getAsFile();
          if (!blob) {
            return false;
          }
          const reader = new FileReader();
          reader.addEventListener("load", () => {
            const { result } = reader;

            if (result) {
              startImageUpload(
                view,
                result.toString(),
                pluginSettings.uploadFile,
                schema
              );
            }
          });
          reader.readAsDataURL(blob);
          event.preventDefault();
          return true;
        },
        // TODO: There might be two kinds of drop events
        //  https://stackoverflow.com/questions/34816849/how-to-access-the-image-data-after-dropping-an-image-from-the-html-part-of-a-web
        drop: (view, event) => {
          const file = event?.dataTransfer?.files?.[0];
          const posData = view.posAtCoords({
            top: event.clientY,
            left: event.clientX,
          });
          const reader = new FileReader();
          reader.onload = () => {
            const { result } = reader;
            if (posData?.pos && result) {
              startImageUpload(
                view,
                result.toString(),
                pluginSettings.uploadFile,
                schema,
                posData.pos
              );
            }
          };
          if (file) {
            reader.readAsDataURL(file);
            event.preventDefault();
            return true;
          }
          return false;
        },
      },
      // handleDrop: (view, event, slice, moved) => {
      //   console.log({
      //     event,
      //     slice,
      //     moved,
      //     data: event?.dataTransfer.getData("text/plain"),
      //   });
      //   return true;
      // },
      // nodeViews: {
      //   image: (node, view, getPos, decorations) => {
      //     const dom = document.createElement("img");
      //     return {
      //       dom,
      //     };
      //   },
      // },
    },
  });
};
