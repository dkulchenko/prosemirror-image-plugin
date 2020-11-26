import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { ImagePluginSettings } from "../types";
import { startImageUpload } from "../utils";

export default <T extends Schema>(
  pluginSettings: ImagePluginSettings,
  schema: T
) => (view: EditorView<T>, event: ClipboardEvent) => {
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
  const file = item.getAsFile();
  if (!file) {
    return false;
  }
  startImageUpload(
    view,
    file,
    pluginSettings.defaultAlt,
    pluginSettings,
    schema
  );
  event.preventDefault();
  return true;
};
