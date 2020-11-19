import { DecorationSet } from "prosemirror-view";

export type ImagePluginState = DecorationSet;

export interface InsertImagePlaceholder {
  type: "add";
  pos: number;
  id: unknown;
}

export interface RemoveImagePlaceholder {
  type: "remove";
  id: unknown;
}

export type ImagePluginAction = InsertImagePlaceholder | RemoveImagePlaceholder;

export interface ImagePluginSettings {
  uploadFile: (file: Blob) => Promise<string>;
}
