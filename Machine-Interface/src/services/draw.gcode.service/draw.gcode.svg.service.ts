import { Point } from 'electron';
import { Constants } from 'src/constants';
import { GCodeColors, Line } from 'src/interfaces/gcodePreivew.interface';
import { mapSpeedToOpacity } from './draw.gcode.helper.service';

export const createSVGString = (
  svgContent: string,
  graphBoxMetrics: Record<string, number>
) => {
  // get the bounding box metrics
  const viewBox = `0 0 ${graphBoxMetrics.platformWidth} ${graphBoxMetrics.platformHeight}`;
  const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${graphBoxMetrics.platformWidth}" height="${graphBoxMetrics.platformHeight}" viewBox="${viewBox}">${svgContent}</svg>`;

  return svgString;
};

export const convertLinesToSVGElements = (
  lines: Line[],
  gcodeCommandsColor: GCodeColors,
  graphBoxMetrics: Record<string, number>,
  start: Point
) => {
  let svgContent = '';
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.type === 'G0') {
      svgContent += drawStraightLineTosvgContent(
        line.type,
        start,
        line,
        gcodeCommandsColor.G0,
        graphBoxMetrics.platformHeight
      );
    } else if (line.type === 'G1') {
      svgContent += drawStraightLineTosvgContent(
        line.type,
        start,
        line,
        gcodeCommandsColor.G1,
        graphBoxMetrics.platformHeight
      );
    } else if (line.type === 'G2') {
      svgContent += drawCurvedLineTosvgContent(
        start,
        line,
        gcodeCommandsColor.G2,
        graphBoxMetrics.platformHeight
      );
    } else if (line.type === 'G3') {
      svgContent += drawCurvedLineTosvgContent(
        start,
        line,
        gcodeCommandsColor.G3,
        graphBoxMetrics.platformHeight
      );
    }
  }
  return svgContent;
};

const drawStraightLineTosvgContent = (
  type: string,
  start: Point,
  line: Line,
  color: string,
  maxY: number
) => {
  const startX = Math.round(
    Constants.GCODE_PREVIEWER_RATIO * (line.start.x - start.x)
  );
  const startY = Math.round(
    maxY - Constants.GCODE_PREVIEWER_RATIO * (line.start.y - start.y)
  );
  const endX = Math.round(
    Constants.GCODE_PREVIEWER_RATIO * (line.end.x - start.x)
  );
  const endY = Math.round(
    maxY - Constants.GCODE_PREVIEWER_RATIO * (line.end.y - start.y)
  );

  let svgContent = `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" `;

  if (type === 'G0') {
    svgContent += `stroke="${color}" `;
  } else {
    if (line.speed) {
      const opacity = mapSpeedToOpacity(line.speed);
      svgContent += `stroke="${color}" stroke-opacity="${opacity}" `;
    } else {
      svgContent += 'stroke="grey" ';
    }
  }

  svgContent += 'stroke-width="0.5" />\n';

  return svgContent;
};

const drawCurvedLineTosvgContent = (
  start: Point,
  line: Line,
  color: string,
  maxY: number
) => {
  const beziers = line.beziers;
  let svgContent = '';

  beziers.forEach((curve) => {
    const startX = Math.round(
      Constants.GCODE_PREVIEWER_RATIO * (curve.p0.x - start.x)
    );
    const startY = Math.round(
      maxY - Constants.GCODE_PREVIEWER_RATIO * (curve.p0.y - start.y)
    );
    const endX = Math.round(
      Constants.GCODE_PREVIEWER_RATIO * (curve.p3.x - start.x)
    );
    const endY = Math.round(
      maxY - Constants.GCODE_PREVIEWER_RATIO * (curve.p3.y - start.y)
    );

    svgContent += `<line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" `;

    if (line.speed) {
      const opacity = mapSpeedToOpacity(line.speed);
      svgContent += `stroke="${color}" stroke-opacity="${opacity}" `;
    } else {
      svgContent += 'stroke="grey" ';
    }

    svgContent += 'stroke-width="0.5" />\n';
  });

  return svgContent;
};
