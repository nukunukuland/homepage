/* =========================================================
   ぬくぬくらんど  共通スクリプト
   （お知らせは content/news/ に書くと、公開のときに自動でページになります）
   ========================================================= */

/* ---------- スマホのメニュー ---------- */
(function setupMenu() {
  const btn = document.querySelector(".menu-btn");
  const nav = document.getElementById("gnav");
  if (!btn || !nav) return;
  const close = () => { btn.setAttribute("aria-expanded", "false"); nav.classList.remove("is-open"); };
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
})();
