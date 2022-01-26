"use-strict";
// Ширина и высота экрана
const vw = Math.max(
  document.documentElement.clientWidth || 0,
  window.innerWidth || 0
);
const vh = Math.max(
  document.documentElement.clientHeight || 0,
  window.innerHeight || 0
);

// Инициализация канваса
let canvas = document.querySelector("canvas");
let ctx = canvas.getContext("2d");

// Растягиваем на весь экран
canvas.width = vw;
canvas.height = vh;

ctx.font = "14px Verdana";

// ГРАФИЧЕСКАЯ БИБЛИОТЕКА
//Функция отрисовки пикселя
let pixel = (x, y, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, 2, 1);
};
//Функция отрисовки линии по Алгоритму Брезенхема
let DrawLine = (x1, y1, x2, y2, stroke) => {
  let dx = x2 - x1;
  let dy = y2 - y1;
  if (
    (Math.abs(dx) > Math.abs(dy) && x2 < x1) ||
    (Math.abs(dx) <= Math.abs(dy) && y2 < y1)
  ) {
    let x = x1;
    x1 = x2;
    x2 = x;
    let y = y1;
    y1 = y2;
    y2 = y;
  }
  dx = x2 - x1;
  dy = y2 - y1;

  let stp = 1;
  pixel(x1, x2, stroke);

  if (Math.abs(dx) > Math.abs(dy)) {
    if (dy < 0) {
      stp = -1;
      dy *= -1;
    }
    let d = dy * 2 - dx;
    let d1 = dy * 2;
    let d2 = (dy - dx) * 2;
    y = y1;
    for (x = x1 + 1; x <= x2; x++) {
      if (d > 0) {
        y = y + stp;
        d = d + d2;
      } else {
        d = d + d1;
      }
      pixel(x, y, stroke);
    }
  } else {
    if (dx < 0) {
      stp = -1;
      dx *= -1;
    }
    d = dx * 2 - dy;
    d1 = dx * 2;
    d2 = (dx - dy) * 2;
    x = x1;
    for (y = y1 + 1; y <= y2; y++) {
      if (d > 0) {
        x = x + stp;
        d = d + d2;
      } else {
        d = d + d1;
      }
      pixel(x, y, stroke);
    }
  }
};
//Функция рисования треугольника
let DrawTriangle = (x1, y1, x2, y2, x3, y3, stroke) => {
  DrawLine(x1, y1, x2, y2, stroke);
  DrawLine(x2, y2, x3, y3, stroke);
  DrawLine(x3, y3, x1, y1, stroke);
};
//Функция рисования окружности по Алгоритму Брезенхема
let DrawCircle = (_x, _y, radius, stroke) => {
  let x = 0,
    y = radius,
    gap = 0,
    delta = 2 - 2 * radius;
  while (y >= 0) {
    pixel(_x + x, _y + y, stroke);
    pixel(_x + x, _y - y, stroke);
    pixel(_x - x, _y - y, stroke);
    pixel(_x - x, _y + y, stroke);
    gap = 2 * (delta + y) - 1;
    if (delta < 0 && gap <= 0) {
      x++;
      delta += 2 * x + 1;
      continue;
    }
    if (delta > 0 && gap > 0) {
      y--;
      delta -= 2 * y + 1;
      continue;
    }
    x++;
    delta += 2 * (x - y);
    y--;
  }
};

//ТРИАНГУЛЯЦИЯ
//Площадь треугольника
let triangleSquare = (A, B, C) => {
  return (
    (1 / 2) * Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y))
  );
};
// Принадлежит ли точка треугольнику?
let inTriangle = (A, B, C, D) => {
  return (
    triangleSquare(A, B, C) ==
    triangleSquare(A, B, D) + triangleSquare(B, C, D) + triangleSquare(C, A, D)
  );
};
// Левая тройка векторов?
let isLeft = (A, B, C) => {
  const AB = {
      x: B.x - A.x,
      y: B.y - A.y,
    },
    AC = {
      x: C.x - A.x,
      y: C.y - A.y,
    };

  return AB.x * AC.y - AC.x * AB.y > 0;
};
// Есть ли другие точки внутри рассматриваемого треугольника?
let hasPointOfPolygon = (points) => {
  const A = points[0],
    B = points[1],
    C = points[2];

  for (let p = 3; p < points.length; p++) {
    if (inTriangle(A, B, C, points[p])) return true;
  }

  return false;
};

let triangulate = (polyg) => {
  const polygon = Array.from(polyg);
  temp = 1;
  while (polygon.length >= 3) {
    if (
      isLeft(polygon[0], polygon[1], polygon[2]) &&
      !hasPointOfPolygon(polygon)
    ) {
      DrawTriangle(
        polygon[0].x,
        polygon[0].y,
        polygon[1].x,
        polygon[1].y,
        polygon[2].x,
        polygon[2].y,
        "purple"
      );
      polygon.splice(1, 1);
      temp++;
    } else {
      const tmp = polygon[0];
      polygon.shift();
      polygon.push(tmp);
    }
  }
};

//СОЗДАНИЕ МНОГОУГОЛЬНИКА
let points = [];
let count = [];
let g = [];

let drawPoints = () => {
  ctx.clearRect(0, 0, vw, vh);
  points.forEach((p) => {
    DrawCircle(p.x, p.y, 2, "purple");
  });
  for (let i = 0; i < points.length - 1; i++) {
    DrawLine(
      points[i].x,
      points[i].y,
      points[i + 1].x,
      points[i + 1].y,
      "purple"
    );
  }
};

function triang(p, x, y) {
  const poly = Array.from(p);
  temp = 1;
  point = { x: x, y: y };
  while (poly.length >= 3) {
    if (isLeft(poly[0], poly[1], poly[2]) && !hasPointOfPolygon(poly)) {
      if (inTriangle(poly[0], poly[1], poly[2], point)) {
        alert("Точка принадлежит многоугольнику");
        temp++;
      }
      poly.splice(1, 1);
    } else {
      const tmp = poly[0];
      poly.shift();
      poly.push(tmp);
    }
  }
  if (temp == 1) {
    alert("Точка не принадлежит многоугольнику");
  }
}

let create = (event) => {
  points.push({ x: event.clientX, y: event.clientY });
  count.push({ x: event.clientX, y: event.clientY });
  g.push({ x: event.clientX, y: event.clientY });
  drawPoints();
};

window.addEventListener("click", create);

window.addEventListener("keydown", () => {
  triangulate(points);
  window.removeEventListener("click", create);
  window.addEventListener(
    "click",
    (t = (event) => {
      DrawCircle(event.clientX, event.clientY, 2, "lime");
      let x = event.clientX;
      let y = event.clientY;
      triang(count, x, y);
    })
  );
});
