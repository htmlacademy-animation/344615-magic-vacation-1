import * as THREE from 'three';

class Figure3d {
  constructor(type, ...params) {
    const typesGeometry = {
      cylinder: new THREE.CylinderGeometry(...params), // цилиндр
      cone: new THREE.ConeGeometry(...params), // конус
      sphere: new THREE.SphereGeometry(...params), // сфера
    };

    if (!typesGeometry[type]) throw new Error('Не указан тип геометрии');

    this.geometry = typesGeometry[type];
  }

  init(...rads) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffff00,
      wireframe: true,
      // skinning: true,
      // morphTargets: true,
    });
    const figure = new THREE.Mesh(this.geometry, material);

    const axesHelper3d = new THREE.AxesHelper(0.1); // оси координат
    figure.add(axesHelper3d);

    if (rads.length) {
      const valuesRotation = rads.map((degNumber) => THREE.MathUtils.degToRad(degNumber));
      figure.rotation.set(...valuesRotation);
    }

    return figure;
  }
}

export default Figure3d;
