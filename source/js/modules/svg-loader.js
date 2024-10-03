import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import path from 'path';

const loader = new SVGLoader();
// load a SVG resource
const svgLoad = (pathPicture, positionX, positionY, positionZ, rotateZ, scale = 0.001) => {
  const group = new THREE.Group();
  loader.load(
    // resource URL
    path.resolve(__dirname, pathPicture),
    // called when the resource is loaded
    function ({ paths }) {
      group.scale.set(scale, scale, scale);
      group.position.set(positionX, positionY, positionZ);
      group.rotation.set(0, 0, THREE.MathUtils.degToRad(rotateZ));

      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];

        const material = new THREE.MeshBasicMaterial({
          color: path.color,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const shapes = SVGLoader.createShapes(path);
        for (let j = 0; j < shapes.length; j++) {
          const extrudeSettings = {
            steps: 2,
            depth: 16,
            bevelEnabled: true,
            bevelThickness: 2,
            bevelSize: 1,
            bevelOffset: 0,
            bevelSegments: 1,
          };

          const shape = shapes[j];
          const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
          const mesh = new THREE.Mesh(geometry, material);
          group.add(mesh);
        }
      }
    },
    // called when loading is in progresses
    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    // called when loading has errors
    function (error) {
      console.log(error, 'An error happened');
    }
  );

  return group;
};

export default svgLoad;
