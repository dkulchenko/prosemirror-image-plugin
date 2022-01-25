import { Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";

import { ImagePluginSettings, ImagePluginState } from "../types";
import { imagePluginKey } from "../utils";
import dropHandler from "./dropHandler";
import imageNodeView from "./imageNodeView";
import pasteHandler from "./pasteHandler";

const imagePlugin = <T extends Schema>(
  schema: T,
  pluginSettings: ImagePluginSettings
): Plugin<ImagePluginState, T> =>
  new Plugin({
    key: imagePluginKey,
    state: pluginSettings.createState(pluginSettings, schema),
    props: {
      decorations: pluginSettings.createDecorations,
      handleDOMEvents: {
        paste: pasteHandler(pluginSettings, schema),
        drop: dropHandler(pluginSettings, schema),
      },
      nodeViews: {
        image: imageNodeView(pluginSettings),
      },
    },
  });

export default imagePlugin;
