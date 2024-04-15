import { Constants } from 'src/constants';

/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import gcodetogeometry from 'gcodetogeometry';

interface Point {
  x: number;
  y: number;
}

interface BezierCurve {
  p0: Point;
  p1: Point;
  p2: Point;
  p3: Point;
}

interface Line {
  start: Point;
  end: Point;
  feedrate: number;
  lineNumber: number;
  speed: number;
  type: string;
  beziers: BezierCurve[];
}

interface GcodeColors {
  G0: string;
  G1: string;
  G2: string;
  G3: string;
}

// to calculate the width and height for the svg
let minX = Infinity;
let minY = Infinity;
let maxX = -Infinity;
let maxY = -Infinity;

const updateBounds = (x: number, y: number) => {
  minX = Math.min(minX, x);
  minY = Math.min(minY, y);
  maxX = Math.max(maxX, x);
  maxY = Math.max(maxY, y);
};

export const convertGCodeToSVG = (
  svgElement: SVGSVGElement,
  gcodeStr: string,
  GcodeCommandsColor: GcodeColors
) => {
  const gcode = gcodetogeometry.parse(gcodeStr);
  if (
    gcode.size.max.x === gcode.size.min.x &&
    gcode.size.max.y === gcode.size.min.y
  ) {
    return;
  }

  const start = { x: gcode.size.min.x, y: gcode.size.min.y };
  let i = 0;

  for (i = 0; i < gcode.lines.length; i++) {
    if (gcode.lines[i].type === 'G0') {
      drawStraightLineToSVG(
        svgElement,
        gcode.lines[i].type,
        start,
        gcode.lines[i],
        GcodeCommandsColor.G0
      );
    } else if (gcode.lines[i].type === 'G1') {
      drawStraightLineToSVG(
        svgElement,
        gcode.lines[i].type,
        start,
        gcode.lines[i],
        GcodeCommandsColor.G1
      );
    } else if (gcode.lines[i].type === 'G2') {
      drawCurvedLineToSVG(
        svgElement,
        start,
        gcode.lines[i],
        GcodeCommandsColor.G2
      );
    } else if (gcode.lines[i].type === 'G3') {
      drawCurvedLineToSVG(
        svgElement,
        start,
        gcode.lines[i],
        GcodeCommandsColor.G3
      );
    }
  }
  // After drawing all paths, set the SVG dimensions
  const width = maxX - minX;
  const height = maxY - minY;

  svgElement.setAttribute('width', width.toString());
  svgElement.setAttribute('height', height.toString());
  svgElement.setAttribute('viewBox', `0 0 ${width} ${height}`);
};

const drawStraightLineToSVG = (
  svgElement: SVGSVGElement,
  type: string,
  start: Point,
  line: Line,
  color: string
) => {
  const ratio = Constants.GRAPH_STEP_SIZE / 2;

  const startX = Math.round(ratio * (line.start.x - start.x));
  const startY = Math.round(ratio * (line.start.y - start.y));
  const endX = Math.round(ratio * (line.end.x - start.x));
  const endY = Math.round(ratio * (line.end.y - start.y));

  const lineElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'line'
  );
  lineElement.setAttribute('x1', startX.toString());
  lineElement.setAttribute('y1', startY.toString());
  lineElement.setAttribute('x2', endX.toString());
  lineElement.setAttribute('y2', endY.toString());

  if (type === 'G0') {
    lineElement.setAttribute('stroke', color);
  } else {
    if (line.speed) {
      const opacity = mapSpeedToOpacity(line.speed);
      lineElement.setAttribute('stroke', color);
      lineElement.setAttribute('stroke-opacity', opacity.toString());
    } else {
      lineElement.setAttribute('stroke', 'grey');
    }
  }

  lineElement.setAttribute('stroke-width', '0.5');

  svgElement.appendChild(lineElement);

  // Update path bounds
  updateBounds(startX, startY);
  updateBounds(endX, endY);
};

const drawCurvedLineToSVG = (
  svgElement: SVGSVGElement,
  start: Point,
  line: Line,
  color: string
) => {
  const ratio = Constants.GRAPH_STEP_SIZE / 2;

  const beziers = line.beziers;
  beziers.forEach((curve) => {
    const startX = Math.round(ratio * (curve.p0.x - start.x));
    const startY = Math.round(ratio * (curve.p0.y - start.y));
    const endX = Math.round(ratio * (curve.p3.x - start.x));
    const endY = Math.round(ratio * (curve.p3.y - start.y));

    const lineElement = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'line'
    );
    lineElement.setAttribute('x1', startX.toString());
    lineElement.setAttribute('y1', startY.toString());
    lineElement.setAttribute('x2', endX.toString());
    lineElement.setAttribute('y2', endY.toString());

    if (line.speed) {
      const opacity = mapSpeedToOpacity(line.speed);
      lineElement.setAttribute('stroke', color);
      lineElement.setAttribute('stroke-opacity', opacity.toString());
    } else {
      lineElement.setAttribute('stroke', 'grey');
    }

    lineElement.setAttribute('stroke-width', '0.5');

    svgElement.appendChild(lineElement);

    // Update path bounds
    updateBounds(startX, startY);
    updateBounds(endX, endY);
  });
};

const mapSpeedToOpacity = (speed: number) => {
  const minSpeed = 0;
  const maxSpeed = 100;
  const minOpacity = 0;
  const maxOpacity = 1;

  // Linear mapping
  const opacity =
    minOpacity +
    ((speed - minSpeed) * (maxOpacity - minOpacity)) / (maxSpeed - minSpeed);

  // Ensure opacity is within range
  return Math.min(Math.max(opacity, minOpacity), maxOpacity);
};
