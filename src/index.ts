// eslint-disable-next-line import/no-unresolved
import { Schema } from "prosemirror-model";
import { EditorView } from "prosemirror-view";
import imagePlugin from "./plugin/index";

import {
  imageAlign,
  ImagePluginSettings,
  RemoveImagePlaceholder,
  InsertImagePlaceholder,
  ImagePluginAction,
  ImagePluginState,
} from "./types";

import updateImageNode from "./updateImageNode";

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

export {
  updateImageNode,
  imageAlign,
  ImagePluginSettings,
  RemoveImagePlaceholder,
  InsertImagePlaceholder,
  ImagePluginAction,
  ImagePluginState,
  imagePlugin,
};
