/*
 * ضع رقم واتساب المتجر الحقيقي هنا: رمز الدولة ثم الرقم، أرقام فقط.
 * مثال شكل فقط وليس رقمًا صالحًا: 968XXXXXXXX
 */
const WHATSAPP_NUMBER = "968XXXXXXXX";
const products = window.ARIYAF_PRODUCTS || [];
const cart = new Map();
let activeCategory = "الكل";

const money = value => Number(value).toLocaleString("ar-OM", {
  minimumFractionDigits: 3, maximumFractionDigits: 3
});
const byId = id => document.getElementById(id);

function renderFilters() {
  const categories = ["الكل", ...new Set(products.map(p => p.category))];
  byId("filters").innerHTML = categories.map(category =>
    `<button class="chip ${category === activeCategory ? "active" : ""}" type="button" data-category="${escapeHtml(category)}">${escapeHtml(category)}</button>`
  ).join("");
  byId("filters").querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderFilters();
      renderProducts();
    });
  });
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[char]));
}
function renderProducts() {
  const visible = products.filter(p => activeCategory === "الكل" || p.category === activeCategory);
  byId("products").innerHTML = visible.map(p => {
    const quantity = cart.get(p.id) || 0;
    return `<article class="product">
      <div class="product-art" aria-hidden="true"><span>${escapeHtml(p.emoji || "🍃")}</span></div>
      <h3>${escapeHtml(p.name)}</h3>
      <div class="description">${escapeHtml(p.description || "")}</div>
      <div class="product-bottom"><span class="price">${money(p.price)} ر.ع.</span>
      ${quantity === 0
        ? `<button class="add" type="button" data-add="${escapeHtml(p.id)}">أضف للسلة +</button>`
        : `<div class="qty"><button type="button" aria-label="تقليل ${escapeHtml(p.name)}" data-minus="${escapeHtml(p.id)}">−</button><span>${quantity}</span><button type="button" aria-label="زيادة ${escapeHtml(p.name)}" data-plus="${escapeHtml(p.id)}">+</button></div>`}
      </div></article>`;
  }).join("");
  byId("products").querySelectorAll("[data-add]").forEach(b => b.onclick = () => changeQty(b.dataset.add, 1));
  byId("products").querySelectorAll("[data-plus]").forEach(b => b.onclick = () => changeQty(b.dataset.plus, 1));
  byId("products").querySelectorAll("[data-minus]").forEach(b => b.onclick = () => changeQty(b.dataset.minus, -1));
}
function changeQty(id, amount) {
  const next = (cart.get(id) || 0) + amount;
  if (next > 0) cart.set(id, next); else cart.delete(id);
  renderProducts();
  renderCart();
}
function renderCart() {
  const selected = products.filter(p => (cart.get(p.id) || 0) > 0);
  const count = selected.reduce((sum, p) => sum + cart.get(p.id), 0);
  const total = selected.reduce((sum, p) => sum + p.price * cart.get(p.id), 0);
  byId("cart-count").textContent = `${count.toLocaleString("ar-OM")} منتجات`;
  byId("total").textContent = `${money(total)} ر.ع.`;
  byId("cart-items").innerHTML = selected.length ? selected.map(p => {
    const qty = cart.get(p.id);
    return `<div class="cart-row"><div>${escapeHtml(p.name)} × ${qty}<span class="cart-sub">${money(p.price)} ر.ع. للوحدة</span><button class="remove" type="button" data-remove="${escapeHtml(p.id)}">إزالة</button></div><strong>${money(p.price * qty)} ر.ع.</strong></div>`;
  }).join("") : '<p class="empty">سلتك فارغة حاليًا. أضف ما يعجبك من المنتجات.</p>';
  byId("cart-items").querySelectorAll("[data-remove]").forEach(b => b.onclick = () => {
    cart.delete(b.dataset.remove); renderProducts(); renderCart();
  });
}
byId("checkout").addEventListener("click", () => {
  const selected = products.filter(p => (cart.get(p.id) || 0) > 0);
  if (!selected.length) { alert("أضف منتجًا واحدًا على الأقل إلى السلة."); return; }
  if (!/^[0-9]{8,15}$/.test(WHATSAPP_NUMBER) || WHATSAPP_NUMBER.includes("X")) {
    alert("رابط واتساب غير جاهز بعد. افتح assets/app.js واستبدل 968XXXXXXXX برقم متجر أرياف الحقيقي، مع رمز الدولة وأرقام فقط.");
    return;
  }
  const total = selected.reduce((sum, p) => sum + p.price * cart.get(p.id), 0);
  const lines = [
    "السلام عليكم، أود طلب المنتجات التالية من متجر أرياف:",
    ...selected.map(p => `• ${p.name} — الكمية: ${cart.get(p.id)} — سعر الوحدة: ${money(p.price)} ر.ع. — الإجمالي: ${money(p.price * cart.get(p.id))} ر.ع.`),
    `الإجمالي النهائي: ${money(total)} ر.ع.`,
    "يرجى تأكيد توفر المنتجات وتكلفة التوصيل."
  ];
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
});
renderFilters();
renderProducts();
renderCart();