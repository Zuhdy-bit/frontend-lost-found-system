const form = document.getElementById('itemForm');
const list = document.getElementById('list');
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const dropZone = document.getElementById('dropZone');

// --- FITUR UPLOAD GAMBAR ---

// Klik area upload untuk buka file manager
dropZone.addEventListener('click', () => imageInput.click());

// Pratinjau gambar setelah dipilih
imageInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
    }
});

// Helper: Konversi file ke Base64
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

// --- FITUR POSTING ---

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    let imageData = "";
    if (imageInput.files[0]) {
        imageData = await toBase64(imageInput.files[0]);
    }

    const data = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        location: document.getElementById('location').value,
        status: document.getElementById('status').value,
        contact: document.getElementById('contact').value,
        image: imageData
    };

    try {
        // Ganti '/items' dengan URL backend Anda
        const res = await fetch('/items', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (res.ok) {
            alert('Postingan berhasil dibagikan! Terima kasih atas kepeduliannya.');
            form.reset();
            imagePreview.innerHTML = `<p>Klik atau Seret Foto ke Sini</p>`;
            loadItems();
        }
    } catch (err) {
        console.error("Gagal mengirim data:", err);
        alert("Gagal terhubung ke server.");
    }
});

// --- FITUR TAMPILKAN DATA ---

async function loadItems() {
    const status = document.getElementById('filterStatus').value;
    const location = document.getElementById('filterLocation').value;

    list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Mencari data...</p>';

    let url = `/items?`;
    if (status) url += `status=${status}&`;
    if (location) url += `location=${encodeURIComponent(location)}`;

    try {
        const res = await fetch(url);
        const items = await res.json();

        list.innerHTML = '';

        if (items.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 50px; color: #94a3b8;">Belum ada laporan di area ini.</p>';
            return;
        }

        items.reverse().forEach(item => {
            const itemCard = document.createElement('div');
            itemCard.className = 'item';
            
            const imgHtml = item.image 
                ? `<img src="${item.image}" class="item-img" alt="barang">`
                : `<div class="item-img" style="display:flex; align-items:center; justify-content:center; color:#cbd5e1;">Tanpa Foto</div>`;

            itemCard.innerHTML = `
                ${imgHtml}
                <div class="item-content">
                    <span class="badge ${item.status}">${item.status}</span>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                    <div class="meta-info">
                        <p>📍 <b>Lokasi:</b> ${item.location}</p>
                        <p>📞 <b>Kontak:</b> ${item.contact}</p>
                    </div>
                </div>
            `;
            list.appendChild(itemCard);
        });
    } catch (err) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Gagal memuat data dari server.</p>';
    }
}

// Inisialisasi awal
loadItems();
