import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = { apiKey: "AIzaSyDo0jp7N7wzNXKM81sELGmUhA9QePDOL7g", databaseURL: "https://rageesports-iq-default-rtdb.firebaseio.com" };
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// قاموس الترجمة
const translations = {
    ar: {
        "hero-title": "تجهيزات الأبطال", "hero-sub": "احصل على أفضل المنتجات الحصرية من ريج إسبورتس",
        "products-title": "المنتجات المتاحة", "ig-text": "انستقرام المتجر", "order-confirm": "تأكيد طلب المنتج",
        "btn-order": "إتمام الطلب", "btn-cancel": "إلغاء",
        "placeholder-name": "اسمك الكامل", "placeholder-phone": "رقم الهاتف", "placeholder-address": "العنوان بالتفصيل"
    },
    en: {
        "hero-title": "CHAMPIONS GEAR", "hero-sub": "Get the most exclusive items from RAGE Esports",
        "products-title": "Available Products", "ig-text": "Store Instagram", "order-confirm": "Confirm Order",
        "btn-order": "Place Order", "btn-cancel": "Cancel",
        "placeholder-name": "Full Name", "placeholder-phone": "Phone Number", "placeholder-address": "Full Address"
    }
};

export const logic = {
    toggleLang: () => {
        const body = document.getElementById('shop-body');
        body.style.opacity = '0';
        setTimeout(() => {
            const lang = document.documentElement.lang === 'ar' ? 'en' : 'ar';
            document.documentElement.lang = lang;
            document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

            // تحديث النصوص والـ Placeholders
            document.querySelectorAll('[data-key]').forEach(el => {
                const key = el.getAttribute('data-key');
                el.innerText = translations[lang][key];
            });
            
            document.getElementById('input-name').placeholder = translations[lang]["placeholder-name"];
            document.getElementById('input-phone').placeholder = translations[lang]["placeholder-phone"];
            document.getElementById('input-addr').placeholder = translations[lang]["placeholder-address"];

            document.getElementById('langBtn').innerText = lang === 'ar' ? 'English' : 'العربية';
            body.style.opacity = '1';
        }, 300);
    }
};

export const ui = {
    openModal: (name, price) => {
        document.getElementById('p_name').value = name;
        document.getElementById('p_price').value = price;
        document.getElementById('selected-item-info').innerHTML = `<p style="margin-bottom:15px; color:#aaa;">أنت تطلب الآن: <b style="color:#fff;">${name}</b></p>`;
        document.getElementById('orderModal').style.display = 'flex';
    },
    closeModal: () => document.getElementById('orderModal').style.display = 'none'
};

window.logic = logic; window.ui = ui;

// جلب المنتجات من الفايربيس
onValue(ref(db, 'siteData/store'), (snap) => {
    const data = snap.val();
    const container = document.getElementById('store-container');
    container.innerHTML = "";
    if (data) {
        Object.values(data).forEach(item => {
            container.innerHTML += `
                <div class="product-card">
                    <img src="${item.img}" class="product-img">
                    <h3>${item.name}</h3>
                    <p class="price">${item.price} IQD</p>
                    <button class="buy-btn" onclick="ui.openModal('${item.name}', '${item.price}')">اطلب الآن | Buy Now</button>
                </div>`;
        });
    }
});

// إرسال الطلب عبر الويب هوك الجديد والواتساب
document.getElementById('checkoutForm').onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const order = {
        name: fd.get('u_name'), phone: fd.get('u_phone'),
        addr: fd.get('u_address'), item: fd.get('p_name'), price: fd.get('p_price')
    };

    const discordWebhook = "https://discord.com/api/webhooks/1484690202697138286/tJbXUgVWsx0En5mxbqSdxiLUve81cuo230LE_3_te0RMQfuTI780pml1Nla_BKfsQsba";

    const payload = {
        embeds: [{
            title: "🛍️ طلب شراء جديد - RAGE STORE",
            color: 16711680,
            fields: [
                { name: "📦 المنتج", value: order.item, inline: true },
                { name: "💰 السعر", value: order.price, inline: true },
                { name: "👤 العميل", value: order.name },
                { name: "📞 الهاتف", value: order.phone },
                { name: "📍 العنوان", value: order.addr }
            ],
            footer: { text: "RAGE STORE AUTOMATION" }
        }]
    };

    try {
        await fetch(discordWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const msg = `مرحباً RAGE STORE، أريد طلب: ${order.item}%0Aالاسم: ${order.name}%0Aالهاتف: ${order.phone}%0Aالعنوان: ${order.addr}`;
        window.open(`https://wa.me/9647901382968?text=${msg}`, '_blank');

        alert("تم إرسال طلبك بنجاح ✅");
        ui.closeModal();
        e.target.reset();
    } catch (err) {
        alert("حدث خطأ، يرجى المحاولة لاحقاً.");
    }
};