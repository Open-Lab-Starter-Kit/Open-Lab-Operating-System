import * as THREE from 'three';
import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/examples/jsm/renderers/CSS2DRenderer';

export const createCustomGrid = (
  platformWidth: number,
  platformHeight: number,
  graphStepSize: number
) => {
  const grid = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0x888888 });

  // Vertical lines
  for (
    let i = -platformWidth / 2;
    i <= platformWidth / 2 + graphStepSize;
    i += graphStepSize
  ) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(i, -1, -platformHeight / 2),
      new THREE.Vector3(i, -1, platformHeight / 2),
    ]);
    const line = new THREE.Line(geometry, material);
    grid.add(line);
  }

  // Horizontal lines
  for (
    let i = -platformHeight / 2;
    i <= platformHeight / 2;
    i += graphStepSize
  ) {
    const geometry = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(-platformWidth / 2, -1, i),
      new THREE.Vector3(platformWidth / 2, -1, i),
    ]);
    const line = new THREE.Line(geometry, material);
    grid.add(line);
  }

  return grid;
};

export const create3DAxisHelpers = (
  platformWidth: number,
  platformHeight: number
) => {
  const arrowHelpers = [];

  // X-axis (red)
  const dirX = new THREE.Vector3(1, 0, 0);
  const origin = new THREE.Vector3(0, 0, 0);
  const lengthX = (platformWidth * 1.3) / 2;
  const colorX = 0xff0000;
  const arrowHelperX = new THREE.ArrowHelper(dirX, origin, lengthX, colorX);
  arrowHelpers.push(arrowHelperX);

  // Y-axis (green)
  const dirY = new THREE.Vector3(0, 1, 0);
  const lengthY = 500;
  const colorY = 0x00ff00;
  const arrowHelperY = new THREE.ArrowHelper(dirY, origin, lengthY, colorY);
  arrowHelpers.push(arrowHelperY);

  // Z-axis (blue)
  const dirZ = new THREE.Vector3(0, 0, -1);
  const lengthZ = (platformHeight * 1.3) / 2;
  const colorZ = 0x0000ff;
  const arrowHelperZ = new THREE.ArrowHelper(dirZ, origin, lengthZ, colorZ);
  arrowHelpers.push(arrowHelperZ);

  return arrowHelpers;
};

export const createLabelRenderer = (
  platformWidth: number,
  platformHeight: number
) => {
  const labelRenderer = new CSS2DRenderer();
  labelRenderer.setSize(platformWidth, platformHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.pointerEvents = 'none';
  return labelRenderer;
};

// Function to create a spindle geometry
export const createSpindle = (
  platformWidth: number,
  platformHeight: number
) => {
  // Define spindle dimensions
  const radiusTop = 5;
  const radiusBottom = 0;
  const height = 50;
  const radialSegments = 50;
  const heightSegments = 1;

  // Create a cylinder geometry for the spindle
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusBottom,
    height,
    radialSegments,
    heightSegments
  );

  // Create a material for the spindle
  const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  // Create a mesh (3D object) using the geometry and material
  const spindle = new THREE.Mesh(geometry, material);

  // Position the spindle at the beginning of the grid
  spindle.position.set(-platformWidth / 2, 25, platformHeight / 2 - 8);

  return spindle;
};

export const createDashedLinesAndLabels = (
  scene: THREE.Scene,
  group: THREE.Group,
  jobGroup: THREE.Group,
  platformWidth: number,
  platformHeight: number
) => {
  // check if the jobGroup contains any drawn children nodes
  if (jobGroup.children.length) {
    const bbox = new THREE.Box3().setFromObject(jobGroup);
    // Create dashed lines
    const horizontalLineLeft = createDashedLine(
      new THREE.Vector3(-platformWidth / 2, 0, (bbox.max.z + bbox.min.z) / 2),
      new THREE.Vector3(bbox.min.x, 0, (bbox.max.z + bbox.min.z) / 2)
    );

    const horizontalLineRight = createDashedLine(
      new THREE.Vector3(bbox.max.x, 0, (bbox.max.z + bbox.min.z) / 2),
      new THREE.Vector3(platformWidth / 2, 0, (bbox.max.z + bbox.min.z) / 2)
    );

    const verticalLineTop = createDashedLine(
      new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, 0, -platformHeight / 2),
      new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, 0, bbox.min.z)
    );

    const verticalLineDown = createDashedLine(
      new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, 0, platformHeight / 2),
      new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, 0, bbox.max.z)
    );

    // Create labels
    const xLabel = createTextLabel(
      (platformWidth / 2 - bbox.max.x).toFixed(2),
      new THREE.Vector3(bbox.max.x + 30, 0, (bbox.max.z + bbox.min.z) / 2 - 20)
    );

    const yLabel = createTextLabel(
      (platformHeight / 2 + bbox.min.z).toFixed(2),
      new THREE.Vector3((bbox.max.x + bbox.min.x) / 2, 0, bbox.min.z - 20)
    );

    // Add lines and labels to the group
    group.add(horizontalLineLeft);
    group.add(horizontalLineRight);
    group.add(verticalLineTop);
    group.add(verticalLineDown);
    group.add(xLabel);
    group.add(yLabel);

    // Add the group to the scene
    scene.add(group);
  }
  // Return the group for further manipulation if necessary
  return group;
};

// Function to create dashed lines
const createDashedLine = (start: THREE.Vector3, end: THREE.Vector3) => {
  const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
  const material = new THREE.LineDashedMaterial({
    color: 0x000000,
    dashSize: 5,
    gapSize: 5,
  });
  const line = new THREE.Line(geometry, material);
  line.computeLineDistances();
  return line;
};

// Function to create text labels
export const createTextLabel = (text: string, position: THREE.Vector3) => {
  const div = document.createElement('div');
  // CSS for the labels
  div.textContent = text;
  div.style.cssText = `
  color: white;
  font-size: 15px;
  background-color: rgb(0, 0, 0, 0.7);
  padding: 2px;
  border-radius: 2px;
  `;
  const label = new CSS2DObject(div);
  label.position.copy(position);
  return label;
};
