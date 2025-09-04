let inventaris = JSON.parse(localStorage.getItem("inventaris")) || [];
let selectedIndex = null;
let actionType = null; // "hapus" atau "pinjam"
let currentPage = 1;
const itemsPerPage = 10;

function tampilkanBarang() {
    const daftar = document.getElementById("daftar");
    daftar.innerHTML = "";

    // Filter search
    const searchValue = document.getElementById("searchInput").value.toLowerCase();
    const rakFilter = document.getElementById("filterRak").value.toLowerCase();

    let filtered = inventaris.filter(item => {
        let cocokSearch = item.nama.toLowerCase().includes(searchValue) || item.jenis.toLowerCase().includes(searchValue);
        let cocokRak = rakFilter === "" || item.rak.toLowerCase() === rakFilter;
        return cocokSearch && cocokRak;
    });

    // Pagination
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = filtered.slice(start, end);

    pageItems.forEach((item, index) => {
        daftar.innerHTML += `
          <div class="item">
            <strong>${item.nama}</strong><br>
            (${item.jenis})<br>
            Stok: ${item.jumlah}<br>
            ${item.rak}<br>
            ${item.foto ? `<img src="${item.foto}">` : ""}<br>
            <button onclick="openModal(${inventaris.indexOf(item)}, 'hapus')">Hapus</button>
            <button onclick="openModal(${inventaris.indexOf(item)}, 'pinjam')">Pinjam</button>
          </div>
        `;
    });

    // Render pagination buttons
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

function openModal(index, type) {
    selectedIndex = index;
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
        message.innerText = `Masukkan nama peminjam untuk menghapus barang "${inventaris[index].nama}"?`;
        jumlahInput.style.display = "none";
    } else {
        title.innerText = "Pinjam Barang";
        message.innerText = `Masukkan nama peminjam & jumlah pinjam (Stok tersedia: ${inventaris[index].jumlah})`;
        jumlahInput.style.display = "block";
    }
    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("modalForm").style.display = "none";
}

function confirmAction() {
    const nama = document.getElementById("namaPeminjam").value.trim();
    const jumlahInput = document.getElementById("jumlahPinjam");
    if (!nama) {
        alert("Nama peminjam harus diisi!");
        return;
    }

    if (actionType === "hapus") {
        inventaris.splice(selectedIndex, 1);
        alert(`Barang berhasil dihapus oleh ${nama}`);
    } else if (actionType === "pinjam") {
        let jumlah = parseInt(jumlahInput.value);
        if (isNaN(jumlah) || jumlah <= 0) {
            alert("Masukkan jumlah yang valid!");
            return;
        }
        if (jumlah > inventaris[selectedIndex].jumlah) {
            alert("Jumlah melebihi stok tersedia!");
            return;
        }
        inventaris[selectedIndex].jumlah -= jumlah;
        alert(`${nama} berhasil meminjam ${jumlah} pcs ${inventaris[selectedIndex].nama}`);
    }

    localStorage.setItem("inventaris", JSON.stringify(inventaris));
    closeModal();
    tampilkanBarang();
}

// Load awal
tampilkanBarang();