import { EditorState, PluginKey } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import {
  ImagePluginState,
  InsertImagePlaceholder,
  RemoveImagePlaceholder,
} from "./types";

export const dataURLtoBlob = (dataURI: string) => {
  const arr = dataURI.split(",");
  const mime = arr[0]?.match(/:(.*?);/)?.[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  // eslint-disable-next-line no-plusplus
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const createPlaceholder = () => {
  const placeholder = document.createElement("placeholder");
  return placeholder;
};

export const defaultDeleteSrc = (src: string) => Promise.resolve();

export const defaultUploadFile = (file: Blob): Promise<string> =>
  new Promise((res) =>
    setTimeout(() => {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const { result } = reader;

        if (result) {
          res(result.toString());
        }
      });
      reader.readAsDataURL(file);
    }, 2000)
  );

export const imagePluginKey = new PluginKey<ImagePluginState>("imagePlugin");

const findPlaceholder = (state: EditorState, id: unknown) => {
  const decos = imagePluginKey.getState(state);
  const found = decos?.find(undefined, undefined, (spec) => spec.id === id);
  return found?.length ? found[0].from : undefined;
};

export const startImageUpload = (
  view: EditorView,
  file: Blob,
  uploadFile: (fileToUpload: Blob) => Promise<string>,
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

export enum imageAlign {
  left = "left",
  right = "right",
  center = "center",
  full = "full",
}

export const defaultExtraAttributes = {
  align: imageAlign.left,
};
