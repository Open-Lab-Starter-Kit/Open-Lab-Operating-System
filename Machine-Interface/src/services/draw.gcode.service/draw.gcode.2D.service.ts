import * as THREE from 'three';
import { MapControls } from 'three/examples/jsm/controls/MapControls';
import { DragControls } from 'three/examples/jsm/controls/DragControls';
import { GCodeColors, Line } from 'src/interfaces/gcodePreivew.interface';
import {
  getGraphStepSize,
  getPlatformDimensions,
  mapSpeedToOpacity,
} from './draw.gcode.helper.service';
import {
  createCustomGrid,
  createDashedLinesAndLabels,
  createLabelRenderer,
} from './draw.gcode.tools.service';
import { configurationSettings } from '../configuration.loader.service';
import { Constants } from 'src/constants';

const config = await configurationSettings();
const { platformWidth, platformHeight } = getPlatformDimensions(config);
const graphStepSize = getGraphStepSize(config) ?? 50;

// x and y values for the starting point for the machine
export let xJobStartingValue = config.machine_platform.start_point.x;
export let yJobStartingValue = config.machine_platform.end_point.y;

// drag and drop event
export let dragAndDropControls: DragControls | null = null;

// initial bounding box for the job layer
let initialBBox: THREE.Box3 | null = null;

const previewerTools = (() => {
  const scene = new THREE.Scene();

  const minDistance = 0.1;
  const maxDistance = Math.max(platformWidth * 2, platformHeight * 2, 1000);

  // Set up orthographic camera
  const camera = new THREE.OrthographicCamera(
    -platformWidth / 2,
    platformWidth / 2,
    platformHeight / 2,
    -platformHeight / 2 + 8,
    minDistance,
    maxDistance
  );

  camera.position.set(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true });

  renderer.setSize(platformWidth, platformHeight, true);

  // Create a CSS2DRenderer for rendering labels
  const labelRenderer = createLabelRenderer(platformWidth, platformHeight);

  const controls = new MapControls(camera, renderer.domElement);
  controls.minZoom = 1;
  controls.maxZoom = 100;
  controls.enableRotate = false;

  controls.addEventListener('change', () => constrainCameraPosition());

  // Grid
  const gridHelper = createCustomGrid(
    platformWidth,
    platformHeight,
    graphStepSize
  );

  // background stream image
  const liveStreamPlane = new THREE.Mesh();

  // Stream camera frame loader
  const streamLoader = new THREE.TextureLoader();

  // Label and dash lines
  const dashLinesAndLabels = new THREE.Group();

  // job layer elements
  const jobLayerElements = (() => {
    const group = new THREE.Group();
    const colorsArray: Uint8Array = new Uint8Array(0);
    // indicator for executed lines
    const executedLineIndex = 0;
    const lineSegmentsIndex = 0;

    return {
      group,
      colorsArray,
      executedLineIndex,
      lineSegmentsIndex,
    };
  })();

  scene.add(jobLayerElements.group);

  // Flip the jobLayerElements.group along the Z axis if the machine is vinyl cutter
  if (config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER) {
    jobLayerElements.group.scale.z *= -1;
  }

  // Rendering and animation
  const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    labelRenderer.render(scene, camera);
    renderer.render(scene, camera);
  };
  animate();

  return {
    scene,
    renderer,
    controls,
    camera,
    gridHelper,
    streamLoader,
    dashLinesAndLabels,
    labelRenderer,
    jobLayerElements,
    liveStreamPlane,
  };
})();

export const draw2DGraph = (
  container: HTMLDivElement,
  isNewFileToDraw: boolean
) => {
  if (isNewFileToDraw) {
    removeGcodeLinesFromGraph();
  }
  container.appendChild(previewerTools.labelRenderer.domElement);
  container.appendChild(previewerTools.renderer.domElement);
};

export const draw2DGcodeLinesOnGraph = (
  linesToDraw: Line[],
  colors: GCodeColors
) => {
  const geometry = new THREE.BufferGeometry();
  // Determine the fixed size of arrays
  const numLines = linesToDraw.length;
  // 2 points per line, 3 coordinates per point
  const positionsArray = new Float32Array(numLines * 6);
  // 2 points per line, 3 color values per point (RGB)
  const colorsArray = new Uint8Array(numLines * 6);
  // 2 points per line, 1 opacity value per point
  const opacitiesArray = new Float32Array(numLines * 2);

  const color = new THREE.Color();

  let index = linesToDraw.length;
  while (index--) {
    const line = linesToDraw[index];
    const opacity = line.speed ? mapSpeedToOpacity(line.speed) : 1;

    // Set color to gray at the beginning
    color.setColorName('black');

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
    const baseOpacityIndex = index * 2;

    // Add the positions for each vertex
    positionsArray[basePosIndex] =
      Constants.GCODE_PREVIEWER_RATIO * line.start.x;
    positionsArray[basePosIndex + 1] = 0;
    positionsArray[basePosIndex + 2] =
      -Constants.GCODE_PREVIEWER_RATIO * line.start.y;
    positionsArray[basePosIndex + 3] =
      Constants.GCODE_PREVIEWER_RATIO * line.end.x;
    positionsArray[basePosIndex + 4] = 0;
    positionsArray[basePosIndex + 5] =
      -Constants.GCODE_PREVIEWER_RATIO * line.end.y;

    // Add the color for each vertex
    colorsArray[basePosIndex] = color.r;
    colorsArray[basePosIndex + 1] = color.g;
    colorsArray[basePosIndex + 2] = color.b;
    colorsArray[basePosIndex + 3] = color.r;
    colorsArray[basePosIndex + 4] = color.g;
    colorsArray[basePosIndex + 5] = color.b;

    // Add the opacities for each vertex
    opacitiesArray[baseOpacityIndex] = opacity;
  }

  // Create Float32 buffer attributes from the arrays
  const positionAttribute = new THREE.Float32BufferAttribute(positionsArray, 3);
  const colorAttribute = new THREE.Float32BufferAttribute(colorsArray, 3);
  const opacityAttribute = new THREE.Float32BufferAttribute(opacitiesArray, 1);

  geometry.setAttribute('position', positionAttribute);
  geometry.setAttribute('color', colorAttribute);
  geometry.setAttribute('opacity', opacityAttribute);

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    vertexShader: `
      attribute float opacity;
      varying float vOpacity;
      varying vec3 vColor;

      void main() {
        vOpacity = opacity;
        vColor = color;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1);
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      varying vec3 vColor;

      void main() {
        gl_FragColor = vec4(vColor, vOpacity);
      }
    `,
  });

  const lineSegments = new THREE.LineSegments(geometry, material);

  // save the color array for the execution process
  const mergedArray = new Uint8Array(
    previewerTools.jobLayerElements.colorsArray.length + colorsArray.length
  );
  mergedArray.set(previewerTools.jobLayerElements.colorsArray);
  mergedArray.set(
    colorsArray,
    previewerTools.jobLayerElements.colorsArray.length
  );
  previewerTools.jobLayerElements.colorsArray = mergedArray;

  const graphStartPointX = -platformWidth / 2;
  const graphStartPointY = platformHeight / 2 - 8;

  lineSegments.position.set(graphStartPointX, 0, graphStartPointY);
  previewerTools.jobLayerElements.group.add(lineSegments);
};

export const add2DExecutedLineToGraph = (color: string) => {
  if (previewerTools.jobLayerElements.group.children.length > 0) {
    // Access the child based on the execution line index, which contains the correct lineSegments
    if (
      previewerTools.jobLayerElements.executedLineIndex /
        (6 * Constants.PREVIEWER_WORKER_BATCH_SIZE) >
      1
    ) {
      previewerTools.jobLayerElements.lineSegmentsIndex += 1;
      previewerTools.jobLayerElements.executedLineIndex = 0;
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

export const add2DGrid = () => {
  previewerTools.scene.add(previewerTools.gridHelper);
};

export const remove2DGrid = () => {
  previewerTools.scene.remove(previewerTools.gridHelper);
};

export const add2DCameraFrame = (cameraFrame: string) => {
  previewerTools.streamLoader.load(cameraFrame, (texture) => {
    // remove the previous frame incase exist
    remove2DCameraFrame();

    // create a new mesh for the new frame
    const planeGeometry = new THREE.PlaneGeometry(
      platformWidth,
      platformHeight
    );

    const planeMaterial = new THREE.MeshBasicMaterial({
      map: texture,
    });

    // Create the plane mesh
    previewerTools.liveStreamPlane = new THREE.Mesh(
      planeGeometry,
      planeMaterial
    );

    // Position the plane at the center of the scene
    previewerTools.liveStreamPlane.position.set(0, -2, 0);
    previewerTools.liveStreamPlane.rotation.x = (Math.PI / 180) * -90;
    // Add the plane to the scene
    previewerTools.scene.add(previewerTools.liveStreamPlane);
  });
};

export const remove2DCameraFrame = () => {
  if (previewerTools.liveStreamPlane) {
    // Remove the plane mesh from the scene
    previewerTools.scene.remove(previewerTools.liveStreamPlane);
  }
};

export const add2DLabels = () => {
  if (previewerTools.jobLayerElements.group) {
    previewerTools.dashLinesAndLabels = createDashedLinesAndLabels(
      previewerTools.scene,
      previewerTools.dashLinesAndLabels,
      previewerTools.jobLayerElements.group,
      platformWidth,
      platformHeight
    );
    // Add the event listener to the drag control
    dragAndDropControls?.addEventListener('drag', updateDashedLinesAndLabels);
  }
};

export const resetAll2DGraphElements = () => {
  removeGcodeLinesFromGraph();
  dragAndDropControls = null;
  xJobStartingValue = config.machine_platform.start_point.x;
  yJobStartingValue = config.machine_platform.end_point.y;
};

export const remove2DLabels = () => {
  // Remove previous dashed lines and labels
  previewerTools.dashLinesAndLabels.clear();
  previewerTools.scene.remove(previewerTools.dashLinesAndLabels);

  // Remove the event listener
  dragAndDropControls?.removeEventListener('drag', updateDashedLinesAndLabels);
};

export const remove2DExecutionLayer = () => {
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
  // Remove drag controls event listeners and clear the controls
  if (dragAndDropControls) {
    dragAndDropControls.removeEventListener(
      'dragstart',
      disableDragAndDropControls
    );
    dragAndDropControls.removeEventListener(
      'dragend',
      enableDragAndDropControls
    );
    dragAndDropControls.removeEventListener('drag', constrainBoxPosition);
    dragAndDropControls.deactivate();
  }
  remove2DLabels();
  remove2DJobLayer();

  // reset controls
  previewerTools.controls.reset();
};

const remove2DJobLayer = () => {
  previewerTools.jobLayerElements.group.clear();
  previewerTools.jobLayerElements.colorsArray = new Uint8Array(0);
  previewerTools.jobLayerElements.executedLineIndex = 0;
  previewerTools.jobLayerElements.lineSegmentsIndex = 0;
  resetJobLayerPosition();
};

const resetJobLayerPosition = () => {
  previewerTools.jobLayerElements.group.position.set(0, 0, 0);
};

export const reset2DGraphControls = () => {
  previewerTools.controls.reset();
};

const disableDragAndDropControls = () => {
  previewerTools.controls.enabled = false;
};

const enableDragAndDropControls = () => {
  previewerTools.controls.enabled = true;
};

export const initDragAndDropControlsFor2DGraph = () => {
  // Create and add bounding box mesh to the jobLayerElements.group group
  const boundingBoxMesh = createBoundingBoxMeshForJobLayer();

  // add bounding box mesh to drag the whole jobLayerElements.group
  previewerTools.jobLayerElements.group.add(boundingBoxMesh);

  // get the bounding box for the mesh
  initialBBox = new THREE.Box3().setFromObject(boundingBoxMesh);

  // Set up drag controls
  dragAndDropControls = new DragControls(
    [previewerTools.jobLayerElements.group],
    previewerTools.camera,
    previewerTools.renderer.domElement
  );

  dragAndDropControls.transformGroup = true;
  // Add event listeners for drag events
  dragAndDropControls.addEventListener('dragstart', () =>
    disableDragAndDropControls()
  );

  dragAndDropControls.addEventListener('dragend', () =>
    enableDragAndDropControls()
  );

  // Constrain the box position during dragging
  dragAndDropControls.addEventListener('drag', () => {
    constrainBoxPosition();
    updateStartJobPosition();
  });
};

const createBoundingBoxMeshForJobLayer = () => {
  const bbox = new THREE.Box3().setFromObject(
    previewerTools.jobLayerElements.group
  );
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
  const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    opacity: 0,
    transparent: true,
  });
  const boxMesh = new THREE.Mesh(geometry, material);

  // Set the position of the boxMesh to match the center of the bounding box
  const center = new THREE.Vector3();
  bbox.getCenter(center);
  boxMesh.position.copy(center);

  if (config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER) {
    // Flip the bounding box mesh along the Z axis
    boxMesh.scale.z = -1;
    boxMesh.position.z = -boxMesh.position.z;
  }

  return boxMesh;
};

const updateDashedLinesAndLabels = () => {
  // Create new dashed lines and labels
  if (previewerTools.jobLayerElements.group) {
    previewerTools.dashLinesAndLabels.clear();
    createDashedLinesAndLabels(
      previewerTools.scene,
      previewerTools.dashLinesAndLabels,
      previewerTools.jobLayerElements.group,
      platformWidth,
      platformHeight
    );
  }
};

const constrainBoxPosition = () => {
  if (previewerTools.jobLayerElements.group && initialBBox) {
    const maxX = platformWidth / 2 - initialBBox.max.x;
    const minX = -(platformWidth / 2) - initialBBox.min.x;

    let maxZ;
    let minZ;

    if (config.machine_type === Constants.MACHINE_TYPE.VINYL_CUTTER) {
      // Swap the minZ and maxZ values due to the flip along the Z axis
      maxZ = -(-platformHeight / 2 + 8 + initialBBox.max.z);
      minZ = -platformHeight / 2 - initialBBox.min.z;
    } else {
      minZ = -platformHeight / 2 - initialBBox.min.z;
      maxZ = platformHeight / 2 - 8 - initialBBox.max.z;
    }

    if (previewerTools.jobLayerElements.group.position.x < minX) {
      previewerTools.jobLayerElements.group.position.x = minX;
    } else if (previewerTools.jobLayerElements.group.position.x > maxX) {
      previewerTools.jobLayerElements.group.position.x = maxX;
    }

    if (previewerTools.jobLayerElements.group.position.z > maxZ) {
      previewerTools.jobLayerElements.group.position.z = maxZ;
    } else if (previewerTools.jobLayerElements.group.position.z < minZ) {
      previewerTools.jobLayerElements.group.position.z = minZ;
    }
  }
};

const constrainCameraPosition = () => {
  // Calculate maximum/minimum movement range based on the scale
  const maxX =
    (previewerTools.camera.zoom - 1) *
    (platformWidth / (previewerTools.camera.zoom * 2));
  const minX =
    -(previewerTools.camera.zoom - 1) *
    (platformWidth / (previewerTools.camera.zoom * 2));
  const maxZ =
    (previewerTools.camera.zoom - 1) *
    (platformHeight / (previewerTools.camera.zoom * 2));
  const minZ =
    -(previewerTools.camera.zoom - 1) *
    (platformHeight / (previewerTools.camera.zoom * 2));

  // Check if the target's x coordinate is within the adjusted grid boundaries
  if (previewerTools.controls.target.x < minX) {
    previewerTools.controls.target.setX(minX);
  } else if (previewerTools.controls.target.x > maxX) {
    previewerTools.controls.target.setX(maxX);
  }

  // Check if the target's z coordinate is within the adjusted grid boundaries
  if (previewerTools.controls.target.z < minZ) {
    previewerTools.controls.target.setZ(minZ);
  } else if (previewerTools.controls.target.z > maxZ) {
    previewerTools.controls.target.setZ(maxZ);
  }

  // Update camera position based on the updated target position
  const distance = previewerTools.camera.position.distanceTo(
    previewerTools.controls.target
  );
  const phi = previewerTools.controls.getPolarAngle();
  const theta = previewerTools.controls.getAzimuthalAngle();
  previewerTools.camera.position.set(
    distance * Math.sin(phi) * Math.sin(theta) +
      previewerTools.controls.target.x,
    distance * Math.cos(phi) + previewerTools.controls.target.y,
    distance * Math.sin(phi) * Math.cos(theta) +
      previewerTools.controls.target.z
  );
};

const updateStartJobPosition = () => {
  xJobStartingValue =
    config.machine_platform.start_point.x +
    previewerTools.jobLayerElements.group.position.x;
  yJobStartingValue =
    config.machine_platform.end_point.y -
    previewerTools.jobLayerElements.group.position.z;
};
