import gcodetogeometry from 'gcodetogeometry';
import { Constants } from 'src/constants';
import { Config } from 'src/interfaces/configSettings.interface';
import { Line, GCodeState } from 'src/interfaces/gcodePreivew.interface';

let parserState: GCodeState;

export const convertGCodeToLines = (gcodeStr: string) => {
  const gcode = gcodetogeometry.parse(
    gcodeStr,
    parserState.settings,
    parserState.totalSize
  );
  const linesToDraw: Line[] = [];

  // update the parser state settings
  parserState.settings = gcode.settings;

  // update the parser state size
  parserState.totalSize = gcode.size;

  for (let i = 0; i < gcode.lines.length; i++) {
    const line = gcode.lines[i];
    if (['G0', 'G1', 'g0', 'g1'].includes(line.type)) {
      addStraightLine(linesToDraw, line);
      updateBoundsStringtLine(line);
    } else if (['G2', 'G3', 'g2', 'g3'].includes(line.type)) {
      addCurvedLine(linesToDraw, line);
      updateBoundsCurevedLine(line);
    }
  }

  return linesToDraw;
};

export const getGraphBoundingBoxMetrics = () => {
  return {
    maxWidth: parserState.bounds.maxX - parserState.bounds.minX,
    maxHeight: parserState.bounds.maxY - parserState.bounds.minY,
  };
};

export const getJobStartPoint = () => {
  return parserState.totalSize?.min;
};

export const mapSpeedToOpacity = (speed: number) => {
  const minSpeed = 0;
  const maxSpeed = 100;
  const minOpacity = 0;
  const maxOpacity = 1;

  const opacity =
    minOpacity +
    ((speed - minSpeed) * (maxOpacity - minOpacity)) / (maxSpeed - minSpeed);

  return Math.min(Math.max(opacity, minOpacity), maxOpacity);
};

const updateBoundsStringtLine = (line: Line) => {
  const startX = Math.round(Constants.GCODE_PREVIEWER_RATIO * line.start.x);
  const startY = Math.round(Constants.GCODE_PREVIEWER_RATIO * line.start.y);
  const endX = Math.round(Constants.GCODE_PREVIEWER_RATIO * line.end.x);
  const endY = Math.round(Constants.GCODE_PREVIEWER_RATIO * line.end.y);
  parserState.bounds.minX = Math.min(parserState.bounds.minX, startX);
  parserState.bounds.minY = Math.min(parserState.bounds.minY, startY);
  parserState.bounds.maxX = Math.max(parserState.bounds.maxX, endX);
  parserState.bounds.maxY = Math.max(parserState.bounds.maxY, endY);
};

const updateBoundsCurevedLine = (line: Line) => {
  for (let i = 0; i < line.beziers.length; i++) {
    const l = line.beziers[i];
    const startX = Math.round(Constants.GCODE_PREVIEWER_RATIO * l.p0.x);
    const startY = Math.round(Constants.GCODE_PREVIEWER_RATIO * l.p0.y);
    const endX = Math.round(Constants.GCODE_PREVIEWER_RATIO * l.p3.x);
    const endY = Math.round(Constants.GCODE_PREVIEWER_RATIO * l.p3.y);
    parserState.bounds.minX = Math.min(parserState.bounds.minX, startX);
    parserState.bounds.minY = Math.min(parserState.bounds.minY, startY);
    parserState.bounds.maxX = Math.max(parserState.bounds.maxX, endX);
    parserState.bounds.maxY = Math.max(parserState.bounds.maxY, endY);
  }
};

const addStraightLine = (linesToDraw: Line[], line: Line) => {
  linesToDraw.push({
    ...line,
    start: {
      x: line.start.x,
      y: line.start.y,
      z: line.start.z ?? 0,
    },
    end: {
      x: line.end.x,
      y: line.end.y,
      z: line.end.z ?? 0,
    },
  });
};

const addCurvedLine = (linesToDraw: Line[], line: Line) => {
  const b = line.beziers;
  for (let i = 0; i < b.length; i++) {
    const l = b[i];
    linesToDraw.push({
      ...line,
      start: {
        x: l.p0.x,
        y: l.p0.y,
        z: l.p0.z ?? 0,
      },
      end: {
        x: l.p3.x,
        y: l.p3.y,
        z: l.p3.z ?? 0,
      },
    });
  }
};

export const getGraphStepSize = (config: Config) => {
  if (config.machine_type === Constants.MACHINE_TYPE.LASER_CUTTER) {
    return config.laser_cutter_settings?.job_previewer.graph_step_size;
  } else if (config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER) {
    return config.vinyl_cutter_settings?.job_previewer.graph_step_size;
  } else if (config.machine_type === Constants.MACHINE_TYPE.CNC) {
    return config.cnc_settings?.job_previewer.graph_step_size;
  }
};

export const getPlatformDimensions = (config: Config) => {
  const platformWidth = Math.abs(
    config.machine_platform.end_point.x - config.machine_platform.start_point.x
  );
  const platformHeight = Math.abs(
    config.machine_platform.end_point.y - config.machine_platform.start_point.y
  );

  return { platformWidth, platformHeight };
};

export const resetParserState = () => {
  parserState = {
    bounds: {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
    settings: {
      feedrate: 0,
      previousMoveCommand: '',
      crossAxe: 'z',
      inMm: false,
      relative: false,
      position: { x: 0, y: 0, z: 0 },
    },
    totalSize: {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    },
  };
};
