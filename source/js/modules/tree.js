import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import path from "path";
import slider from "../modules/slider";
/**
 * дока https://threejs.org/manual/#ru/fundamentals
 * https://threejs.org/editor/
 */

const canvas = document.querySelector("#treejs");

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const fov = 75; // поле зрения.

const aspect = window.innerWidth / window.innerHeight; // значение для canvas по умолчанию
const near = 0.1; //Усеченная форма камеры вблизи плоскости
//Представляют пространство перед камерой, которое будет отображаться. Все, что находится до или после этого диапазона, будет обрезано (не нарисовано).
const far = 1000; //Дальняя плоскость усеченной камеры. Значение по умолчанию - 2000.
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.set(0, 0, 0.6);

// Функция для обновления позиции камеры и направления взгляда
function updateCameraPosition(x, y, z, lookAtX, lookAtY, lookAtZ) {
  // Перемещаем камеру
  camera.position.set(x, y, z);

  // Указываем точку, на которую нужно смотреть
  camera.lookAt(new THREE.Vector3(lookAtX, lookAtY, lookAtZ));
}

const scene = new THREE.Scene();

let activeIndex = 0;

const boxWidth = 2;
const boxHeight = 1;
const geometry = new THREE.PlaneGeometry(boxWidth, boxHeight);

const loader = new THREE.TextureLoader();
const textures = Array(5)
  .fill(null)
  .map((_, index) => {
    const texture = loader.load(
      path.resolve(__dirname, `img/module-5/scenes-textures/scene-${index}.png`)
    );

    return texture;
  });

const material1 = new THREE.MeshBasicMaterial({
  map: textures.at(0),
  side: THREE.DoubleSide,
});
const material2 = new THREE.MeshBasicMaterial({
  map: textures.at(1),
  side: THREE.DoubleSide,
});
const material3 = new THREE.MeshBasicMaterial({
  map: textures.at(2),
  side: THREE.DoubleSide,
});
const material4 = new THREE.MeshBasicMaterial({
  map: textures.at(3),
  side: THREE.DoubleSide,
});

const material5 = new THREE.MeshBasicMaterial({
  map: textures.at(4),
  side: THREE.DoubleSide,
});

const plane1 = new THREE.Mesh(geometry, material1); //Полигональная сетка фигуры
const plane2 = new THREE.Mesh(geometry, material2); //Полигональная сетка фигуры
const plane3 = new THREE.Mesh(geometry, material3); //Полигональная сетка фигуры
const plane4 = new THREE.Mesh(geometry, material4); //Полигональная сетка фигуры
const plane5 = new THREE.Mesh(geometry, material5); //Полигональная сетка фигуры

plane2.translateX(plane1.position.x + plane1.geometry.parameters.width);
plane3.translateX(plane2.position.x + plane2.geometry.parameters.width);
plane4.translateX(plane3.position.x + plane3.geometry.parameters.width);
plane5.translateX(plane4.position.x + plane4.geometry.parameters.width);

scene.add(plane1);
scene.add(plane2);
scene.add(plane3);
scene.add(plane4);
scene.add(plane5);

// const controls = new TrackballControls(camera, renderer.domElement);
// const controls = new OrbitControls(camera, renderer.domElement); // Управление орбитой позволяет камере вращаться вокруг цели.

/** HELPERS  */
const cameraHelper = new THREE.CameraHelper(camera); // оси камеры
const arrowHelper = new THREE.ArrowHelper(); // cвет
// const boxHelper = new THREE.PlaneHelper(plane); // граница фигуры
const grid = new THREE.GridHelper(5, 25); // отражение горизонта
const axesHelper = new THREE.AxesHelper(5); // оси координат
scene.add(axesHelper, grid, cameraHelper, arrowHelper);
/** END HELPERS  */

function render() {
  renderer.render(scene, camera);
}

document.body.addEventListener("screenChanged", ({ detail }) => {
  if (detail.screenName !== "story") {
    updateCameraPosition(0, 0, 0.6, 0, 0, 0);
  } else {
    updateCameraPosition(activeIndex + 2, 0, 0.6, activeIndex + 2, 0, 0);
  }

  slider.storySlider.on("transitionEnd", function () {
    activeIndex = slider.storySlider.realIndex;
    updateCameraPosition(activeIndex + 2, 0, 0.6, activeIndex + 2, 0, 0);
  });
});

renderer.setSize(window.innerWidth, window.innerHeight);

// Функция рендера (зациклена)
(function animate() {
  console.log("animate");
  requestAnimationFrame(animate);

  // controls.update();

  render();
})();
