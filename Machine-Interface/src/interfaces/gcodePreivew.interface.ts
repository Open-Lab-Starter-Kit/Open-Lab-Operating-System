export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface BezierCurve {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

export interface Line {
  start: Point;
  end: Point;
  feedrate: number;
  lineNumber: number;
  speed: number;
  type: string;
  beziers: BezierCurve[];
}

export interface GCodeColors {
  G0: string;
  G1: string;
  G2: string;
  G3: string;
  executedLine: string;
}

export interface CameraData {
  type: string;
  frame: string;
  time: string;
}

export interface GraphBoxMetrics {
  width: number;
  height: number;
}

export interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GCodeParserSettings {
  feedrate: number;
  previousMoveCommand: string;
  crossAxe: string;
  inMm: boolean;
  relative: boolean;
  position: Point;
}

export interface GCodeState {
  bounds: Bounds;
  settings: GCodeParserSettings | null;
  totalSize: TotalGCodeSize | null;
}

export interface TotalGCodeSize {
  min: Point;
  max: Point;
}
