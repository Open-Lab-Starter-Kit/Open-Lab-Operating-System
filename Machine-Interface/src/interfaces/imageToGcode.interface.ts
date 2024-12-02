import { INode } from 'svgson';

export interface DitheringSettings {
  algorithm: string;
  grayShift: number;
  resolution: number;
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

export interface ImageMetrics {
  x?: number;
  y?: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface MainSettings {
  material: string;
  thickness: number;
  metrics: ImageMetrics;
  scale: number;
  filename: string;
}

export interface EngravingSettings extends OperationMainSettings {
  dithering: DitheringSettings;
}

export interface GcodeFileSettings {
  mainSettings: MainSettings;
  cuttingSettings: ThicknessOperation;
  markingSettings: ThicknessOperation;
  engravingSettings: EngravingSettings;
}

export interface RejectedFileEntry {
  failedPropValidation: string;
  file: File;
}

export interface MaterialData {
  materialId: number;
  materialName: string;
  materialImage: string | null;
  materialThicknesses: Array<MaterialThickness>;
  isEditable?: boolean;
}

export interface MaterialThickness {
  thicknessId: number;
  thicknessValue: number;
  thicknessOperations: Array<ThicknessOperation>;
}

export interface ThicknessOperation extends OperationMainSettings {
  operationId: number;
  operationType: string;
  dithering?: DitheringSettings;
}

export interface OperationMainSettings {
  power: number;
  speed: number;
  tool: string;
}
