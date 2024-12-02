import { Constants } from 'src/constants';
import { GCodeColors, Line } from 'src/interfaces/gcodePreivew.interface';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { configurationSettings } from '../configuration.loader.service';
import {
  getGraphStepSize,
  getPlatformDimensions,
} from './draw.gcode.helper.service';
import {
  create3DAxisHelpers,
  createCustomGrid,
} from './draw.gcode.tools.service';

const config = await configurationSettings();
const { platformWidth, platformHeight } = getPlatformDimensions(config);
const graphStepSize = getGraphStepSize(config) ?? 50;

// x and y values for the starting point for the machine
export const xJobStartingValue = config.machine_platform.start_point.x;
export const yJobStartingValue = config.machine_platform.end_point.y;

// Variables to keep track of the bounding box
let minX = Infinity,
  minY = Infinity,
  maxX = -Infinity,
  maxY = -Infinity,
  centerX = 0,
  centerY = 0;

const previewerTools = (() => {
  const scene = new THREE.Scene();

  // Set up orthographic camera
  const minDistance = 0.1;
  const maxDistance = Math.max(platformWidth * 2, platformHeight * 2, 1000);

  const camera = new THREE.PerspectiveCamera(
    -platformWidth,
    platformWidth / platformHeight,
    minDistance,
    maxDistance
  );

  camera.position.set(0, (500 * platformWidth) / platformHeight, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });

  renderer.setSize(1000, 600, true);

  const controls = new OrbitControls(camera, renderer.domElement);

  // control the zoom in/out
  controls.minDistance = minDistance;
  controls.maxDistance = maxDistance;

  // grid
  const gridHelper = createCustomGrid(
    platformWidth,
    platformHeight,
    graphStepSize
  );
  scene.add(gridHelper);

  // axis helper
  const axisHelpers = create3DAxisHelpers(platformWidth, platformHeight);
  axisHelpers.forEach((helper) => scene.add(helper));

  // job layer elements
  const jobLayerElements = (() => {
    const group = new THREE.Group();
    const colorsArray: Float32Array = new Float32Array(0);
    const executedLineIndex = 0;
    const lineSegmentsIndex = 0;
    return { group, colorsArray, executedLineIndex, lineSegmentsIndex };
  })();

  scene.add(jobLayerElements.group);

  jobLayerElements.group.renderOrder = 1; // Render job layer first

  // Rendering and animation
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  };
  animate();

  return {
    scene,
    renderer,
    controls,
    camera,
    gridHelper,
    jobLayerElements,
  };
})();

export const draw3DGraph = (
  container: HTMLDivElement,
  isNewFileToDraw: boolean
) => {
  if (isNewFileToDraw) {
    removeGcodeLinesFromGraph();
  }
  container.appendChild(previewerTools.renderer.domElement);
};

export const draw3DGcodeLinesOnGraph = (
  linesToDraw: Line[],
  colors: GCodeColors
) => {
  const geometry = new THREE.BufferGeometry();
  // Determine the fixed size of arrays
  const numLines = linesToDraw.length;
  // 2 points per line, 3 coordinates per point
  const positionsArray = new Float32Array(numLines * 6);
  // 2 points per line, 3 color values per point (RGB)
  const colorsArray = new Float32Array(numLines * 6);

  const color = new THREE.Color();

  linesToDraw.forEach((line, index) => {
    // Set color to gray at the beginning
    color.setColorName('gray');

    if (line.type === 'G0') color.setColorName(colors.G0);
    else if (line.type === 'G1') {
      if (line.speed) color.setColorName(colors.G1);
    } else if (line.type === 'G2') {
      if (line.speed) color.setColorName(colors.G2);
    } else if (line.type === 'G3') {
      if (line.speed) color.setColorName(colors.G3);
    }

    // Calculate base index for current line in arrays
    const basePosIndex = index * 6;

    // Add the positions for each vertex
    positionsArray[basePosIndex] =
      Constants.GCODE_PREVIEWER_RATIO * line.start.x;
    positionsArray[basePosIndex + 1] =
      Constants.GCODE_PREVIEWER_RATIO * (line.start.z ?? 0);
    positionsArray[basePosIndex + 2] =
      -Constants.GCODE_PREVIEWER_RATIO * line.start.y;
    positionsArray[basePosIndex + 3] =
      Constants.GCODE_PREVIEWER_RATIO * line.end.x;
    positionsArray[basePosIndex + 4] =
      Constants.GCODE_PREVIEWER_RATIO * (line.end.z ?? 0);
    positionsArray[basePosIndex + 5] =
      -Constants.GCODE_PREVIEWER_RATIO * line.end.y;

    // Update bounding box
    minX = Math.min(minX, line.start.x, line.end.x);
    minY = Math.min(minY, line.start.z ?? 0, line.end.z ?? 0);
    maxX = Math.max(maxX, line.start.x, line.end.x);
    maxY = Math.max(maxY, line.start.z ?? 0, line.end.z ?? 0);

    // Add the color for each vertex

    // Add the color for each vertex
    colorsArray[basePosIndex] = color.r;
    colorsArray[basePosIndex + 1] = color.g;
    colorsArray[basePosIndex + 2] = color.b;
    colorsArray[basePosIndex + 3] = color.r;
    colorsArray[basePosIndex + 4] = color.g;
    colorsArray[basePosIndex + 5] = color.b;
  });

  // Calculate the center of the bounding box
  centerX = (minX + maxX) / 2;
  centerY = (minY + maxY) / 2;

  // Offset positions to center the lines
  for (let i = 0; i < positionsArray.length; i += 3) {
    positionsArray[i] -= centerX; // x
    positionsArray[i + 2] -= centerY; // z
  }

  // Convert arrays to Float32Array for BufferGeometry
  const positionAttribute = new THREE.Float32BufferAttribute(positionsArray, 3);
  const colorAttribute = new THREE.Float32BufferAttribute(colorsArray, 3);

  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', colorAttribute);

  // Create a material that supports vertex colors and transparency
  const material = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
  });

  // Create a LineSegments object
  const lineSegments = new THREE.LineSegments(geometry, material);

  // save the color array for the execution process
  previewerTools.jobLayerElements.colorsArray = new Float32Array([
    ...previewerTools.jobLayerElements.colorsArray,
    ...colorsArray,
  ]);

  // Add the line segments to the scene
  previewerTools.jobLayerElements.group.add(lineSegments);
};

export const add3DExecutedLineToGraph = (color: string) => {
  if (previewerTools.jobLayerElements.group.children.length > 0) {
    // Access the child based on the execution line index, which contains the correct lineSegments
    if (
      previewerTools.jobLayerElements.executedLineIndex /
        (6 * Constants.PREVIEWER_WORKER_BATCH_SIZE) >
      1
    ) {
      previewerTools.jobLayerElements.lineSegmentsIndex += 1;
    }

    const lineSegments = previewerTools.jobLayerElements.group.children[
      previewerTools.jobLayerElements.lineSegmentsIndex
    ] as THREE.LineSegments;

    // Get the geometry of the lineSegments
    const geometry = lineSegments.geometry;

    if (geometry.attributes.color) {
      const colorsArray = geometry.attributes.color.array;
      const lineColor = new THREE.Color(color);

      // Update the color for both vertices of the line
      for (
        let i = previewerTools.jobLayerElements.executedLineIndex;
        i <= previewerTools.jobLayerElements.executedLineIndex + 5;
        i += 3
      ) {
        colorsArray[i] = lineColor.r;
        colorsArray[i + 1] = lineColor.g;
        colorsArray[i + 2] = lineColor.b;
      }

      // Increment the executedLineIndex to process the next line
      previewerTools.jobLayerElements.executedLineIndex += 6;

      // Mark the color attribute for update
      geometry.attributes.color.needsUpdate = true;
    }
  }
};

export const add3DGrid = () => {
  previewerTools.scene.add(previewerTools.gridHelper);
};

export const remove3DGrid = () => {
  previewerTools.scene.remove(previewerTools.gridHelper);
};

export const reset3DGraphControls = () => {
  previewerTools.controls.reset();
};

export const remove3DExecutionLayer = () => {
  if (previewerTools.jobLayerElements.group.children.length > 0) {
    let colorArrayIndex = 0;

    for (
      let i = 0;
      i < previewerTools.jobLayerElements.group.children.length;
      i++
    ) {
      const lineSegments = previewerTools.jobLayerElements.group.children[
        i
      ] as THREE.LineSegments;

      // Get the geometry of the lineSegments
      const geometry = lineSegments.geometry;

      // Check if the geometry has a color attribute
      if (geometry.attributes.color) {
        const colorAttribute = geometry.attributes.color;
        // Number of values in the color array (3 per vertex)
        const colorCount = colorAttribute.count * 3;

        // Get the slice of the colorsArray that corresponds to this line segment
        const colorSlice = previewerTools.jobLayerElements.colorsArray.slice(
          colorArrayIndex,
          colorArrayIndex + colorCount
        );

        // Create a new Float32BufferAttribute with the sliced color data
        const slicedColorAttribute = new THREE.Float32BufferAttribute(
          colorSlice,
          3
        );

        // Set the sliced color attribute to the geometry
        geometry.setAttribute('color', slicedColorAttribute);

        // Mark the color attribute for update
        geometry.attributes.color.needsUpdate = true;

        // Update the colorArrayIndex for the next line segment
        colorArrayIndex += colorCount;
      }
    }

    // Reset indices
    previewerTools.jobLayerElements.executedLineIndex = 0;
    previewerTools.jobLayerElements.lineSegmentsIndex = 0;
  }
};

const removeGcodeLinesFromGraph = () => {
  previewerTools.jobLayerElements.group.clear();

  // reset controls
  previewerTools.controls.reset();
};
