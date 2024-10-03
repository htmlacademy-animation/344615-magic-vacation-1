import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import path from 'path';
import slider from '../modules/slider';
import throttle from 'lodash/throttle';
import Figure3d from './Figure';
import svgLoad from './svg-loader';

/*eslint array-element-newline: ["error", "always"]*/

/**
 * дока https://threejs.org/manual/#ru/fundamentals
 * https://threejs.org/editor/
 * @react-three/fiber //компоненты
 * @react-three/drei  (вспомогательные функции).
 * https://threejs.org/manual/#ru/primitives - трехмерные фигуры
 */

const canvas = document.querySelector('#treejs');

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

let activeIndex = 2; //FIXME на 0 вернуть

const boxWidth = 2;
const boxHeight = 1;
const geometry = new THREE.PlaneGeometry(boxWidth, boxHeight);

const loader = new THREE.TextureLoader();
const textures = Array(5)
  .fill(null)
  .map((_, index) => {
    const texture = loader.load(path.resolve(__dirname, `img/module-5/scenes-textures/scene-${index}.png`), undefined, (err) => {
      console.error(`Error loading texture ${index}:, err`);
    });

    return texture;
  });

const material1 = new THREE.MeshBasicMaterial({
  map: textures.at(0),
  side: THREE.DoubleSide,
});

const materialRaw1 = new THREE.RawShaderMaterial({
  uniforms: {
    uTexture: { type: 't', value: textures.at(0) }, // Используем первую текстуру
  },
  vertexShader: ` 
    precision mediump float;

    uniform mat4 modelViewMatrix; // Матрица модели-вида
    uniform mat4 projectionMatrix; // Матрица проекции
    uniform float hue;

    attribute vec3 position; // Атрибут позиции
    attribute vec2 uv; // Атрибут UV координат

    varying vec2 vUv;
    

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;
    uniform sampler2D uTexture;
    varying vec2 vUv;

    void main() {
      gl_FragColor = texture2D(uTexture, vUv);
    }`,
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

let positionRaw3X = 0.4;
let positionRaw3Y = 0;
const materialRaw3 = new THREE.RawShaderMaterial({
  uniforms: {
    uTexture: { value: textures.at(2) }, // Текстура больше не требует типа "t"
    hue: { value: 0 },
    lensCenter: { value: new THREE.Vector2(positionRaw3X, positionRaw3Y) }, // Центр линзы
    lensRadius: { value: 0.1 }, // Радиус линзы
    lensStrength: { value: 0.5 }, // Сила эффекта линзы
    aspectRatio: { value: aspect }, // Добавляем аспектное соотношение
    outlineColor: { value: new THREE.Color(0xffffff) }, // Белый цвет обводки
    outlineAlpha: { value: 0.15 }, // Прозрачность обводки
    outlineThickness: { value: 0.003 }, // Толщина обводки
    highlightColor: { value: new THREE.Color(0xffffff) }, // Белый цвет блика
    highlightAlpha: { value: 0.15 }, // Прозрачность блика
    highlightThickness: { value: 0.001 }, // Толщина блика
    highlightOffset: { value: new THREE.Vector2(0.01, 0.01) }, // Смещение блика
  },
  vertexShader: ` 
    precision mediump float;

    uniform mat4 modelViewMatrix; // Матрица модели-вида
    uniform mat4 projectionMatrix; // Матрица проекции
    uniform float hue;

    attribute vec3 position; // Атрибут позиции
    attribute vec2 uv; // Атрибут UV координат

    // Varying-переменная для передачи uv во фрагментный шейдер
    varying vec2 vUv;

    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision mediump float;

    uniform sampler2D uTexture;
    uniform float hue; // Смещение оттенка
    varying vec2 vUv;

    uniform vec2 lensCenter; // Центр линзы
    uniform float lensRadius; // Радиус линзы
    uniform float lensStrength; // Сила эффекта линзы
    uniform float aspectRatio; // Аспектное соотношение

    uniform vec3 outlineColor; // Цвет обводки
    uniform float outlineAlpha; // Прозрачность обводки
    uniform float outlineThickness; // Толщина обводки

    uniform vec3 highlightColor; // Цвет блика
    uniform float highlightAlpha; // Прозрачность блика
    uniform float highlightThickness; // Толщина блика
    uniform vec2 highlightOffset; // Смещение блика

    void main() {
      // Корректируем координаты с учетом аспектного соотношения
      vec2 centeredUv = (vUv - lensCenter);
      centeredUv.x *= aspectRatio;

      // Вычисляем расстояние от центра линзы
      float dist = length(centeredUv);

      // Искажение UV-координат внутри линзы
      vec2 distortedUv = vUv;
      if (dist < lensRadius) {
          // Нормализуем расстояние
          float percent = dist / lensRadius;

          // Вычисляем силу искажения
          float distortion = 1.0 - percent * lensStrength;

          // Применяем искажение к UV-координатам
          vec2 offset = (vUv - lensCenter) / aspectRatio;
          distortedUv = lensCenter + offset * distortion * aspectRatio;
      }

      // Получаем цвет из текстуры с новыми координатами
      vec4 color = texture2D(uTexture, distortedUv);

      // Применяем смещение оттенка (hue shift)
      float angle = hue * 3.14159265;
      float s = sin(angle), c = cos(angle);
      vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
      color.rgb = vec3(
          dot(color.rgb, weights.xyz),
          dot(color.rgb, weights.zxy),
          dot(color.rgb, weights.yzx)
      );

      // Добавление обводки
      float outlineDist = abs(dist - lensRadius);
      float outline = smoothstep(outlineThickness, 0.0, outlineDist);
      color.rgb = mix(color.rgb, outlineColor, outlineAlpha * outline);

      // Добавление блика (простая реализация: смещенный белый круг)
      vec2 highlightPos = lensCenter + highlightOffset;
      vec2 highlightCenteredUv = (vUv - highlightPos);
      highlightCenteredUv.x *= aspectRatio;
      float highlightDist = length(highlightCenteredUv);
      float highlight = smoothstep(highlightThickness, 0.0, highlightDist);
      color.rgb = mix(color.rgb, highlightColor, highlightAlpha * highlight);

      gl_FragColor = color;
    }
  `,
  side: THREE.DoubleSide,
});
materialRaw3.uniformsNeedUpdate = true;

const material4 = new THREE.MeshBasicMaterial({
  map: textures.at(3),
  side: THREE.DoubleSide,
});

const material5 = new THREE.MeshBasicMaterial({
  map: textures.at(4),
  side: THREE.DoubleSide,
});

const plane1 = new THREE.Mesh(geometry, materialRaw1); //Полигональная сетка фигуры
const plane2 = new THREE.Mesh(geometry, material2); //Полигональная сетка фигуры
const plane3 = new THREE.Mesh(geometry, materialRaw3); //Полигональная сетка фигуры
const plane4 = new THREE.Mesh(geometry, material4); //Полигональная сетка фигуры
const plane5 = new THREE.Mesh(geometry, material5); //Полигональная сетка фигуры

plane2.translateX(plane1.position.x + plane1.geometry.parameters.width);
plane3.translateX(plane2.position.x + plane2.geometry.parameters.width);
plane4.translateX(plane3.position.x + plane3.geometry.parameters.width);
plane5.translateX(plane4.position.x + plane4.geometry.parameters.width);

/** PRIMITIVES */

const mathNum = (n) => n / 1000;
const sizeToRadius = (v) => (v * Math.sqrt(2)) / 2; // узнаем радиус на основе ширины квадрата
const degToRadian = (v) => (v * Math.PI) / 180; // получаем радианы на основе градусов

/** Создание освальных форм ковров */
const createCarpet = (widthCarpet, insideRadius, degStart, degEnd, height) => {
  const points = [
    new THREE.Vector2(mathNum(insideRadius), 0),
    new THREE.Vector2(mathNum(insideRadius + widthCarpet), 0),
    new THREE.Vector2(mathNum(insideRadius + widthCarpet), mathNum(height)),
  ];
  const geometryСarpet = new THREE.LatheGeometry(points, 32, degToRadian(degStart), degToRadian(degEnd));
  const materialCarpet = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
  const carpet = new THREE.Mesh(geometryСarpet, materialCarpet);

  return carpet;
};

const sideLength = mathNum(250);
const height = mathNum(280);
const radius = sizeToRadius(sideLength);
const radialSegments = 4;

const triangle = new Figure3d('cone', radius, height, radialSegments).init(0, 45, 0);
triangle.position.x = 1;
triangle.position.z = 0.8;

/**Стойка */
const radiusCylinder = mathNum(7);
const heightCylinder = mathNum(230);
const segment = 20;

const stoika = new Figure3d('cylinder', radiusCylinder, radiusCylinder, heightCylinder, segment, segment).init();
stoika.position.z = 1;
stoika.position.x = 1;

/** Стойка низ */
const radiusStoikaBottom = mathNum(16);
const heightStoikaBottom = mathNum(120);
const stoikaBottom = new Figure3d('cylinder', radiusStoikaBottom, radiusStoikaBottom, heightStoikaBottom, 20, 20).init();

const radiusSphere = mathNum(16);
const stoikaSphera = new Figure3d('sphere', radiusSphere, 20, 20).init();
stoikaSphera.position.y = heightStoikaBottom / 2;
stoikaBottom.add(stoikaSphera);
stoika.add(stoikaBottom);

/** Лампа */
const heightLampa = mathNum(60);
const radiusTop = sizeToRadius(mathNum(42));
const radiusBottom = sizeToRadius(mathNum(34));
const lampa = new Figure3d('cylinder', radiusTop, radiusBottom, heightLampa, 4, 4).init(0, 45, 0);
lampa.position.y = heightCylinder / 2 + heightLampa / 2;

/** верх лампы */
const heightLampaTop = mathNum(6);
const radiusTopLampaTop = sizeToRadius(mathNum(45));
const radiusBottomLampaTop = sizeToRadius(mathNum(57));
const lampaTop = new Figure3d('cylinder', radiusTopLampaTop, radiusBottomLampaTop, heightLampaTop, 4, 4).init();
lampaTop.position.y = heightLampa / 2;

/** Низ лампы */
const heightLampaBottom = mathNum(4);
const radiusTopLampaBottom = sizeToRadius(mathNum(37));
const radiusBottomLampaBottom = sizeToRadius(mathNum(37));
const lampaBottom = new Figure3d('cylinder', radiusTopLampaBottom, radiusBottomLampaBottom, heightLampaBottom, 4, 4).init();
lampaBottom.position.y = -heightLampa / 2;

/** Cнеговик */

const radiusSnegTop = mathNum(44);
const sneg = new Figure3d('sphere', radiusSnegTop, 20, 20).init();

const radiusSnegBottom = mathNum(75);
const snegBottom = new Figure3d('sphere', radiusSnegBottom, 20, 20).init();

const heightNose = mathNum(75);
const radiusNose = mathNum(18);

const nose = new Figure3d('cone', radiusNose, heightNose, 10).init(90, 0, 0);

sneg.position.x = 1;
sneg.position.z = 1.5;
snegBottom.position.y = -0.1;
nose.position.z = 0.05;

sneg.add(snegBottom, nose);

lampa.add(lampaTop);
lampa.add(lampaBottom);
stoika.add(lampa);

stoikaBottom.position.y = -heightCylinder + heightLampa;

/** Коврик 1 */
/**
 * - x определяет радиус от оси вращения (оси Y).
    - y определяет высоту вдоль оси Y.
 */
const widthCarpet = 180;
const insideRadius = 760;
const degStart = 16;
const degEnd = 74;
const heightCarpet = 3;

const carpet = createCarpet(widthCarpet, insideRadius, degStart, degEnd, heightCarpet);
carpet.position.x = 1;
carpet.position.z = 2;

/** Коврик 2 */
const widthCarpet2 = 160;
const insideRadius2 = 732;
const degStart2 = 0;
const degEnd2 = 90;
const heightCarpet2 = 3;

const carpet2 = createCarpet(widthCarpet2, insideRadius2, degStart2, degEnd2, heightCarpet2);
carpet2.position.x = 0;
carpet2.position.z = 2;

/** planet */
const bigPlanet = new Figure3d('sphere', mathNum(60), 24, 24).init();
const smallPlanet = new Figure3d('sphere', mathNum(10), 24, 24).init();
const line = new Figure3d('cylinder', mathNum(0.5), mathNum(0.5), mathNum(200), 24, 24).init();
line.position.y = mathNum(60) + mathNum(200 / 2);
const widthRing = 40;
const insideRadiusRing = 80;
const heightRing = 2;

const ring = createCarpet(widthRing, insideRadiusRing, 0, 360, heightRing);
ring.rotation.set(degToRadian(18), 0, 0);

bigPlanet.position.x = 1.5;
bigPlanet.position.z = 1;
smallPlanet.position.y = mathNum(100);

bigPlanet.add(smallPlanet, ring, line);

scene.add(plane1, plane2, plane3, plane4, plane5, triangle, stoika, sneg, carpet, carpet2, bigPlanet);
/** END PRIMITIVES */

/** LOAD SVG */
const flamingo = svgLoad('img/module-6/svg-forms/flamingo.svg', 0, 0.5, 0.5, 180);
const flower = svgLoad('img/module-6/svg-forms/flower.svg', -0.01, 0.5, 0.5, 180);
const keyhole = svgLoad('img/module-6/svg-forms/keyhole.svg', -1, 0.5, 0.5, 180);
const leaf = svgLoad('img/module-6/svg-forms/leaf.svg', 0.03, 0.3, 0.5, 180);
const question = svgLoad('img/module-6/svg-forms/question.svg', 0.04, 0.2, 0.5, 180);
const snowflake = svgLoad('img/module-6/svg-forms/snowflake.svg', 0.05, 0.1, 0.5, 180);

scene.add(flamingo, flower, keyhole, leaf, question, snowflake);

// const controls = new TrackballControls(camera, renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement); // Управление орбитой позволяет камере вращаться вокруг цели.

/** HELPERS  */
const cameraHelper = new THREE.CameraHelper(camera); // оси камеры
const arrowHelper = new THREE.ArrowHelper(); // cвет
// const boxHelper = new THREE.PlaneHelper(plane); // граница фигуры
const grid = new THREE.GridHelper(5, 25); // отражение горизонта
const axesHelper = new THREE.AxesHelper(5); // оси координат
scene.add(axesHelper, grid, arrowHelper);
/** END HELPERS  */

// Теперь вы можете изменять значения оттенка и насыщенности
materialRaw3.uniforms.hue.value = -0.1; // Измените оттенок

function render() {
  renderer.render(scene, camera);
}

document.body.addEventListener('screenChanged', ({ detail }) => {
  if (detail.screenName !== 'story') {
    updateCameraPosition(0, 0, 0.6, 0, 0, 0);
  } else {
    updateCameraPosition(activeIndex + 2, 0, 0.6, activeIndex + 2, 0, 0);
  }

  slider.storySlider.on('transitionEnd', function () {
    activeIndex = slider.storySlider.realIndex;
    // updateCameraPosition(activeIndex + 2, 0, 0.6, activeIndex + 2, 0, 0); //FIXME: вернуть
    positionRaw3Y = 0;
  });
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Функция рендера (зациклена)
(function animate() {
  console.log('animate');
  requestAnimationFrame(animate);
  controls.update();
  if (activeIndex === 2) {
    positionRaw3Y += 0.0035;
    materialRaw3.uniforms.lensCenter.value = new THREE.Vector2(positionRaw3X, positionRaw3Y);
  }

  render();
})();

window.addEventListener(
  'resize',
  throttle(() => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  }, 500)
);
