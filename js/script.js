// ページ読み込み時にフェードイン効果を適用
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll('.fade-in');
  elements.forEach((el, index) => {
    setTimeout(() => {
      el.classList.add('visible');
    }, 200 * index);
  });
});
