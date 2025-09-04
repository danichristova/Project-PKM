let inventaris = [];
let selectedIndex = null;
let actionType = null;
let currentPage = 1;
const itemsPerPage = 10;

// Ambil data dari MySQL
async function fetchInventaris() {
    const res = await fetch("http://localhost:8000/pkm/ambil.php");
    inventaris = await res.json();
    tampilkanBarang();
}

function tampilkanBarang() {
    const daftar = document.getElementById("daftar");
    daftar.innerHTML = "";

    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const rakFilter = document.getElementById("filterRak").value.toLowerCase();

    let filtered = inventaris.filter(item => {
        let cocokSearch = item.nama.toLowerCase().includes(searchValue) ||
                          item.jenis.toLowerCase().includes(searchValue);
        let cocokRak = rakFilter === "" || item.rak.toLowerCase() === rakFilter;
        return cocokSearch && cocokRak;
    });

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);

    pageItems.forEach((item) => {
        daftar.innerHTML += `
          <div class="item">
            <strong>${item.nama}</strong><br>
            (${item.jenis})<br>
            Stok: ${item.jumlah}<br>
            ${item.rak}<br>
            <button onclick="openModal(${item.id}, 'hapus')">Hapus</button>
            <button onclick="openModal(${item.id}, 'pinjam')">Pinjam</button>
          </div>
        `;
    });

    const pagination = document.getElementById("pagination");
    pagination.innerHTML = "";
    if (totalPages > 1) {
        for (let i = 1; i <= totalPages; i++) {
            pagination.innerHTML += `<button onclick="goToPage(${i})" ${i === currentPage ? 'disabled' : ''}>${i}</button>`;
        }
    }
}

function goToPage(page) {
    currentPage = page;
    tampilkanBarang();
}

function openModal(id, type) {
    selectedIndex = id;
    actionType = type;
    const modal = document.getElementById("modalForm");
    const title = document.getElementById("modalTitle");
    const message = document.getElementById("modalMessage");
    const jumlahInput = document.getElementById("jumlahPinjam");
    const namaInput = document.getElementById("namaPeminjam");

    namaInput.value = "";
    jumlahInput.value = "";

    if (type === "hapus") {
        title.innerText = "Hapus Barang";
        message.innerText = `Masukkan nama peminjam untuk menghapus barang ini`;
        jumlahInput.style.display = "none";
    } else {
        // cari data stok
        const barang = inventaris.find(i => i.id == id);
        title.innerText = "Pinjam Barang";
        message.innerText = `Masukkan nama peminjam & jumlah pinjam (Stok tersedia: ${barang.jumlah})`;
        jumlahInput.style.display = "block";
    }
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("modalForm").style.display = "none";
}

async function confirmAction() {
    const nama = document.getElementById("namaPeminjam").value.trim();
    const jumlahInput = document.getElementById("jumlahPinjam");

    if (!nama) {
        alert("Nama peminjam harus diisi!");
        return;
    }

    let formData = new FormData();
    formData.append("id", selectedIndex);
    formData.append("nama", nama);

    if (actionType === "hapus") {
        const res = await fetch("http://localhost:8000/pkm/hapus.php", {
            method: "POST",
            body: formData
        });
        alert(await res.text());
    } else if (actionType === "pinjam") {
        let jumlah = parseInt(jumlahInput.value);
        if (isNaN(jumlah) || jumlah <= 0) {
            alert("Masukkan jumlah yang valid!");
            return;
        }
        formData.append("jumlah", jumlah);

        const res = await fetch("http://localhost:8000/pkm/pinjam.php", {
            method: "POST",
            body: formData
        });
        alert(await res.text());
    }

    closeModal();
    fetchInventaris(); // refresh data
}

// Load awal
fetchInventaris();
