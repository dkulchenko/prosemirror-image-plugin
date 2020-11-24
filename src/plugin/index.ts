import { Schema } from "prosemirror-model";
import { Plugin } from "prosemirror-state";
import { ImagePluginSettings, ImagePluginState } from "../types";
import { defaultSettings } from "../defaults";
import { imagePluginKey } from "../utils";
import imageNodeView from "./imageNodeView";
import createState from "./createState";
import pasteHandler from "./pasteHandler";
import dropHandler from "./dropHandler";

const imagePlugin = <T extends Schema>(
  schema: T,
  settings: Partial<ImagePluginSettings> = {}
): Plugin<ImagePluginState, T> => {
  const pluginSettings = { ...defaultSettings, ...settings };
  return new Plugin({
    key: imagePluginKey,
    state: createState(pluginSettings, schema),
    props: {
      decorations(state) {
        return imagePluginKey.getState(state);
      },
      handleDOMEvents: {
        paste: pasteHandler(pluginSettings, schema),
        drop: dropHandler(pluginSettings, schema),
      },
      nodeViews: {
        image: imageNodeView(pluginSettings),
      },
    },
  });
};

export default imagePlugin;
