import * as THREE from "three";
/**
 * дока https://threejs.org/manual/#ru/fundamentals
 */

const canvas = document.querySelector("#treejs");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const fov = 75; // поле зрения.

const aspect = window.innerWidth / window.innerHeight; // значение для canvas по умолчанию
const near = 0.1; //Усеченная форма камеры вблизи плоскости
//Представляют пространство перед камерой, которое будет отображаться. Все, что находится до или после этого диапазона, будет обрезано (не нарисовано).
const far = 2000; //Дальняя плоскость усеченной камеры. Значение по умолчанию - 2000.
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

camera.position.z = 4;
camera.position.y = 1;
// camera.rotateY((45 * Math.PI) / 180);
// camera.rotateX((45 * Math.PI) / 180);
// camera.rotateZ((45 * Math.PI) / 180);

const scene = new THREE.Scene();

const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const material = new THREE.MeshBasicMaterial({ color: 0x44aa88 }); // greenish blue

const cube = new THREE.Mesh(geometry, material); //Полигональная сетка
// scene.add(cube);

/** HELPERS  */
const cameraHelper = new THREE.CameraHelper(camera); // оси камеры
const arrowHelper = new THREE.ArrowHelper(); // cвет
const boxHelper = new THREE.BoxHelper(cube); // граница фигуры
const grid = new THREE.GridHelper(5, 25); // отражение горизонта
const axesHelper = new THREE.AxesHelper(5); // оси координат
scene.add(axesHelper, grid, cameraHelper, arrowHelper, boxHelper);

/** END HELPERS  */

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.render(scene, camera);

// function render(time) {
//   time *= 0.0007; // конвертировать время в секунды

//   cube.rotation.x = time;
//   cube.rotation.y = time;

//   renderer.render(scene, camera);

//   requestAnimationFrame(render);
// }
// requestAnimationFrame(render);
