//js/gallery.js（スライド写真＋スマホ対応）

const galleryImages = [
  "image/gallery/photo1.jpg",
  "image/gallery/photo2.jpg",
  "image/gallery/photo3.jpg"
];

const track = document.querySelector(".gallery-track");
const indicators = document.querySelector(".gallery-indicators");

let currentIndex = 0;

function updateGallery() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;
  indicators.innerHTML = galleryImages
    .map((_, i) =>
      `<span class="${i === currentIndex ? "active" : ""}" data-index="${i}"></span>`
    ).join("");
}

galleryImages.forEach(src => {
  const img = document.createElement("img");
  img.src = src;
  track.appendChild(img);
});

indicators.addEventListener("click", e => {
  if (e.target.dataset.index) {
    currentIndex = parseInt(e.target.dataset.index);
    updateGallery();
  }
});

// スワイプ操作（スマホ）
let startX = 0;
track.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});
track.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  if (startX - endX > 50) {
    currentIndex = Math.min(currentIndex + 1, galleryImages.length - 1);
  } else if (endX - startX > 50) {
    currentIndex = Math.max(currentIndex - 1, 0);
  }
  updateGallery();
});

updateGallery();

// 3秒ごとに自動スワイプ
setInterval(() => {
  currentIndex = (currentIndex + 1) % galleryImages.length;
  updateGallery();
}, 3000);
