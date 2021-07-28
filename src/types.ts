import { DecorationSet, EditorView } from "prosemirror-view";
import { Node as PMNode } from "prosemirror-model";

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
  downloadImage?: (url: string) => Promise<string>;
  downloadPlaceholder?: string;
  uploadFile: (file: File) => Promise<string>;
  deleteSrc: (src: string) => Promise<void>;
  hasTitle: boolean;
  extraAttributes: Record<string, string | null>;
  createOverlay: (
    node: PMNode,
    getPos: (() => number) | boolean,
    view: EditorView
  ) => Node | undefined;
  updateOverlay: (
    overlayRoot: Node,
    getPos: (() => number) | boolean,
    view: EditorView,
    node: PMNode
  ) => void;
  defaultTitle: string;
  defaultAlt: string;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum imageAlign {
  left = "left",
  right = "right",
  center = "center",
  fullWidth = "fullWidth",
}
