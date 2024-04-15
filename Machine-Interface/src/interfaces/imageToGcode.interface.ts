import { INode } from 'svgson';

export interface DitheringSettings {
  type: string;
  grayShift: number;
  blockSize: number;
  blockDistance: number;
}

export interface TransformData {
  [key: string]: number | number[];
}

export interface IColorElement {
  color: string;
  elements: INode[];
}

export interface IShapeElement {
  shape: string;
  elements: INode[];
}

export interface SelectedElementType {
  identifier: string;
  elements: INode[];
  profileType: string;
  added: boolean;
}

export interface DrawElement {
  identifier: string;
  elements: INode[];
  type: string;
}

export interface GcodeFileSettings {
  feedRate: number;
  seekRate: number;
  onCommand: string;
  offCommand: string;
  paperSize: number[];
  margin: number;
  flipX: boolean;
  flipY: boolean;
  fileName: string;
  dithering: DitheringSettings;
}
