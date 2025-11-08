document.addEventListener("DOMContentLoaded", () => {
  // 1. Ambil semua tombol
  const btnFcfs = document.getElementById("btn-fcfs");
  const btnSjf = document.getElementById("btn-sjf");
  const btnRr = document.getElementById("btn-rr");

  // 2. Ambil semua konten materi
  const contentFcfs = document.getElementById("content-fcfs");
  const contentSjf = document.getElementById("content-sjf");
  const contentRr = document.getElementById("content-rr");

  // 3. Simpan dalam array agar mudah di-loop
  const allButtons = [btnFcfs, btnSjf, btnRr];
  const allContents = [contentFcfs, contentSjf, contentRr];

  // Fungsi untuk menyembunyikan semua konten
  function hideAllMateri() {
    allContents.forEach(content => {
      content.classList.add("hidden");
    });
  }

  // Fungsi untuk menghapus .active dari semua tombol
  function removeAllActive() {
    allButtons.forEach(btn => {
      btn.classList.remove("active");
    });
  }

  // Fungsi untuk menampilkan materi yang dipilih
  function showMateri(contentToShow, btnToActivate) {
    hideAllMateri();
    removeAllActive();

    // Tampilkan konten dan aktifkan tombol yang dipilih
    contentToShow.classList.remove("hidden");
    btnToActivate.classList.add("active");
  }

  // 4. Tambahkan Event Listener untuk setiap tombol
  btnFcfs.addEventListener("click", () => {
    showMateri(contentFcfs, btnFcfs);
  });

  btnSjf.addEventListener("click", () => {
    showMateri(contentSjf, btnSjf);
  });

  btnRr.addEventListener("click", () => {
    showMateri(contentRr, btnRr);
  });

  // 5. Atur keadaan awal: Tampilkan FCFS saat halaman baru dimuat
  showMateri(contentFcfs, btnFcfs);
});