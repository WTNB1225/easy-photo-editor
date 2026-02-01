const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let image = null;
let texts = [];
let nextId = 0;

// image state
let imgScale = 1;
let imgRotation = 0;
let currentFilter = "none";

// drag state
let draggingText = null;
let offsetX = 0;
let offsetY = 0;

function draw() {
  if (!image) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // image transform
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(imgRotation);
  ctx.scale(imgScale, imgScale);
  ctx.filter = currentFilter;
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();

  ctx.filter = "none";

  texts.forEach(t => {
    ctx.font = `
      ${t.italic ? "italic" : ""}
      ${t.bold ? "bold" : ""}
      ${t.size}px ${t.font}
    `;
    ctx.fillStyle = t.color;
    ctx.fillText(t.text, t.x, t.y);

    if (t.outline) {
      ctx.strokeStyle = "black";
      ctx.lineWidth = 2;
      ctx.strokeText(t.text, t.x, t.y);
    }
  });
}

// ===== テキストドラッグ =====
canvas.addEventListener("mousedown", e => {
  const r = canvas.getBoundingClientRect();
  const mx = e.clientX - r.left;
  const my = e.clientY - r.top;

  [...texts].reverse().forEach(t => {
    ctx.font = `${t.size}px ${t.font}`;
    const w = ctx.measureText(t.text).width;
    if (mx > t.x && mx < t.x + w && my < t.y && my > t.y - t.size) {
      draggingText = t;
      offsetX = mx - t.x;
      offsetY = my - t.y;
    }
  });
});

canvas.addEventListener("mousemove", e => {
  if (!draggingText) return;
  const r = canvas.getBoundingClientRect();
  draggingText.x = e.clientX - r.left - offsetX;
  draggingText.y = e.clientY - r.top - offsetY;
  draw();
});

canvas.addEventListener("mouseup", () => draggingText = null);

// ===== テキスト追加 =====
document.getElementById("addText").onclick = () => {
  const t = {
    id: nextId++,
    text: "New Text",
    x: 50,
    y: 50,
    size: 30,
    color: "red",
    font: "serif",
    bold: false,
    italic: false,
    outline: false
  };
  texts.push(t);
  createTextEditor(t);
  draw();
};

function createTextEditor(t) {
  const el = document.createElement("div");
  el.className = "text-editor";
  el.innerHTML = `
    <input value="${t.text}">
    <input type="number" value="${t.size}">
    <select>
      <option value="serif">Serif</option>
      <option value="sans-serif">Sans</option>
      <option value="monospace">Mono</option>
      <option value="cursive">Cursive</option>
    </select>
    <input value="${t.color}">
    <label><input type="checkbox"> Bold</label>
    <label><input type="checkbox"> Italic</label>
    <label><input type="checkbox"> Outline</label>
    <button>削除</button>
  `;

  const [
    textInput, sizeInput, fontSelect, colorInput,
    boldChk, italicChk, outlineChk, delBtn
  ] = el.children;

  fontSelect.value = t.font;

  textInput.oninput = e => { t.text = e.target.value; draw(); };
  sizeInput.oninput = e => { t.size = +e.target.value; draw(); };
  fontSelect.onchange = e => { t.font = e.target.value; draw(); };
  colorInput.oninput = e => { t.color = e.target.value; draw(); };

  boldChk.querySelector("input").onchange = e => { t.bold = e.target.checked; draw(); };
  italicChk.querySelector("input").onchange = e => { t.italic = e.target.checked; draw(); };
  outlineChk.querySelector("input").onchange = e => { t.outline = e.target.checked; draw(); };

  delBtn.onclick = () => {
    texts = texts.filter(x => x.id !== t.id);
    el.remove();
    draw();
  };

  document.getElementById("textList").appendChild(el);
}

// ===== 画像アップロード =====
document.getElementById("fileInput").onchange = e => {
  const img = new Image();
  img.src = URL.createObjectURL(e.target.files[0]);
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    image = img;
    draw();
  };
};

// ===== フィルター =====
document.getElementById("filterGray").onclick = () => {
  currentFilter = "grayscale(100%)";
  draw();
};
document.getElementById("filterBlur").onclick = () => {
  currentFilter = "blur(4px)";
  draw();
};
document.getElementById("filterNone").onclick = () => {
  currentFilter = "none";
  draw();
};

document.getElementById("rotate").oninput = e => {
  imgRotation = (+e.target.value * Math.PI) / 180;
  draw();
};
document.getElementById("scale").oninput = e => {
  imgScale = +e.target.value;
  draw();
};

document.getElementById("saveBtn").onclick = () => {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "image.png";
  a.click();
};
