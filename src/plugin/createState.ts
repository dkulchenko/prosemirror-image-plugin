import { Decoration, DecorationSet } from "prosemirror-view";
import { Transaction } from "prosemirror-state";
import { Schema } from "prosemirror-model";
import { ImagePluginAction, ImagePluginSettings } from "../types";
import { createPlaceholder, imagePluginKey } from "../utils";

export default <T extends Schema>(
  pluginSettings: ImagePluginSettings,
  schema: T
) => ({
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
});
