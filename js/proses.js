document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMEN DOM ---
  const linkFcfs = document.getElementById("link-fcfs");
  const linkSjf = document.getElementById("link-sjf");
  const linkRr = document.getElementById("link-rr");
  const backButton = document.getElementById("back-button");
  const hitungRrButton = document.getElementById("hitung-rr-button");
  const mainTitle = document.querySelector(".title");
  const methodLinks = document.querySelectorAll(".methods a");

  const initialInputSection = document.getElementById("initial-input");
  const resultFcfsSection = document.getElementById("result-fcfs");
  const resultSjfSection = document.getElementById("result-sjf");
  const rrInputQuantum = document.getElementById("input-rr-quantum");
  const resultRrSection = document.getElementById("result-rr");
  const burstTimeInputs = document.querySelectorAll(".burst-time-input");

  // --- FUNGSI UTILITY ---

  // Mengambil data Burst Time dari input
  function getProcessData() {
    const processes = [];
    burstTimeInputs.forEach((input) => {
      processes.push({
        name: input.getAttribute("data-process"),
        bt: parseInt(input.value) || 0, // Pastikan nilai adalah integer
        at: 0, // Asumsi Arrival Time = 0 untuk semua
      });
    });
    return processes;
  }

  // --- LOGIKA PERHITUNGAN ---

  /**
   * Menghitung First-Come, First-Served (FCFS)
   * Asumsi Arrival Time (AT) = 0 untuk semua
   */
  function calculateFCFS() {
    const processes = getProcessData();
    let currentTime = 0;
    const results = [];
    const gantt = [];

    for (const p of processes) {
      const wt = currentTime; // Waiting Time = Waktu selesai proses sebelumnya
      currentTime += p.bt; // Waktu selesai proses ini
      const tat = currentTime - p.at; // Turn Around Time = CT - AT

      results.push({ name: p.name, bt: p.bt, wt: wt, tat: tat });
      gantt.push({
        name: p.name,
        start: wt,
        end: currentTime,
        duration: p.bt,
      });
    }
    return { results, gantt };
  }

  /**
   * Menghitung Shortest Job First (SJF) - Non-Preemptive
   * Asumsi Arrival Time (AT) = 0 untuk semua
   */
  function calculateSJF() {
    const processes = getProcessData();
    // Urutkan proses berdasarkan Burst Time (BT) terpendek
    processes.sort((a, b) => a.bt - b.bt);

    let currentTime = 0;
    const results = [];
    const gantt = [];

    for (const p of processes) {
      const wt = currentTime;
      currentTime += p.bt;
      const tat = currentTime - p.at;

      results.push({ name: p.name, bt: p.bt, wt: wt, tat: tat });
      gantt.push({
        name: p.name,
        start: wt,
        end: currentTime,
        duration: p.bt,
      });
    }

    // Kembalikan urutan hasil ke urutan P1, P2, P3 untuk tampilan tabel
    results.sort((a, b) => a.name.localeCompare(b.name));
    return { results, gantt };
  }

  /**
   * Menghitung Round Robin (RR)
   * Asumsi Arrival Time (AT) = 0 untuk semua
   */
  function calculateRR(quantum) {
    // Buat salinan data proses + tambahkan remaining burst time
    const processes = getProcessData().map((p) => ({
      ...p,
      remaining_bt: p.bt,
    }));
    const n = processes.length;
    const gantt = [];
    const resultsMap = new Map(); // Untuk menyimpan hasil akhir
    processes.forEach(p => resultsMap.set(p.name, { ...p, wt: 0, tat: 0, ct: 0 }));

    let currentTime = 0;
    let completed = 0;

    while (completed < n) {
      let allDone = true; // Tandai jika semua proses sudah selesai di iterasi ini
      for (const p of processes) {
        if (p.remaining_bt > 0) {
          allDone = false; // Masih ada proses yang berjalan
          const execTime = Math.min(p.remaining_bt, quantum);
          const startTime = currentTime;

          currentTime += execTime;
          p.remaining_bt -= execTime;

          gantt.push({
            name: p.name,
            start: startTime,
            end: currentTime,
            duration: execTime,
          });

          if (p.remaining_bt === 0) {
            completed++;
            // Proses selesai, hitung CT, TAT, dan WT
            const result = resultsMap.get(p.name);
            result.ct = currentTime; // Completion Time
            result.tat = result.ct - result.at;
            result.wt = result.tat - result.bt;
            resultsMap.set(p.name, result);
          }
        }
      }
      if (allDone) break; // Keluar dari loop jika tidak ada lagi yang diproses
    }

    // Ubah Map ke Array untuk display
    const results = Array.from(resultsMap.values());
    // Urutkan kembali berdasarkan nama P1, P2, P3
    results.sort((a, b) => a.name.localeCompare(b.name));
    
    return { results, gantt };
  }

  /**
   * Fungsi DINAMIS untuk menampilkan hasil di tabel dan Gantt Chart
   */
  function displayResults(method, results, gantt) {
    const resultBody = document.getElementById(`table-body-${method}`);
    const avgWtCell = document.getElementById(`avg-wt-${method}`);
    const avgTatCell = document.getElementById(`avg-tat-${method}`);
    const ganttRow = document.getElementById(`gantt-row-${method}`);
    const ganttTimes = document.getElementById(`gantt-times-${method}`);

    // Kosongkan konten sebelumnya
    resultBody.innerHTML = "";
    ganttRow.innerHTML = "";
    ganttTimes.innerHTML = "";

    let totalWt = 0;
    let totalTat = 0;
    const n = results.length;

    // 1. Isi Tabel Hasil
    results.forEach((p) => {
      const row = `
            <tr>
              <td>${p.name}</td>
              <td>${p.bt}</td>
              <td>${p.wt.toFixed(2)}</td>
              <td>${p.tat.toFixed(2)}</td>
            </tr>`;
      resultBody.innerHTML += row;
      totalWt += p.wt;
      totalTat += p.tat;
    });

    // 2. Isi Rata-rata
    avgWtCell.textContent = (totalWt / n).toFixed(2);
    avgTatCell.textContent = (totalTat / n).toFixed(2);

    // 3. Isi Gantt Chart (KEMBALI KE VERSI ASLI + SEDIKIT PERBAIKAN UNTUK 0 DURASI)
    const totalDuration = gantt.length > 0 ? gantt[gantt.length - 1].end : 0; // Waktu selesai total

    // Filter time points agar hanya yang unik
    const timePoints = [0];
    gantt.forEach((block) => timePoints.push(block.end));
    const uniqueTimePoints = [...new Set(timePoints)];
    
    uniqueTimePoints.forEach(time => {
        ganttTimes.innerHTML += `<span>${time}</span>`;
    });

    // Buat blok Gantt Chart
    gantt.forEach((block) => {
      // Pastikan duration tidak negatif atau terlalu kecil
      const safeDuration = Math.max(0, block.duration); 
      const percentageWidth = (safeDuration / totalDuration) * 100;

      // Jika totalDuration 0 atau block.duration 0, beri lebar minimal atau N/A
      const finalWidth = totalDuration === 0 || safeDuration === 0 ? '0%' : `${percentageWidth}%`;

      const ganttBlock = `<div class="gantt-block" style="width: ${finalWidth}">${block.name}</div>`;
      ganttRow.innerHTML += ganttBlock;
    });
  } // <--- KURUNG KURAWAL INI PENTING!

  // --- FUNGSI TAMPILAN (Show/Hide) ---

  // Fungsi untuk menyembunyikan semua bagian hasil dan input RR
  function hideAllSections() {
    initialInputSection.classList.add("hidden");
    resultFcfsSection.classList.add("hidden");
    resultSjfSection.classList.add("hidden");
    resultRrSection.classList.add("hidden");
    rrInputQuantum.classList.add("hidden");
  }

  // Fungsi untuk menyembunyikan semua bagian hasil dan menampilkan input awal
  function showInitialInput() {
    hideAllSections();
    initialInputSection.classList.remove("hidden");

    // Tampilkan judul utama ("Pilih Metode di bawah")
    mainTitle.textContent = "Pilih Metode di bawah";
    mainTitle.classList.remove("hidden-title");

    removeActiveClass();
  }

  // Fungsi untuk menampilkan bagian hasil
  function showResultSection(sectionToShow, activeLink) {
    hideAllSections();
    sectionToShow.classList.remove("hidden");

    // Sembunyikan judul utama
    mainTitle.classList.add("hidden-title");

    removeActiveClass();
    activeLink.classList.add("active");
  }

  // Fungsi untuk menghapus kelas 'active' dari semua link metode
  function removeActiveClass() {
    methodLinks.forEach((link) => {
      link.classList.remove("active");
    });
  }

  // --- EVENT LISTENERS (YANG SUDAH DIPERBAIKI) ---

  // FCFS
  linkFcfs.addEventListener("click", (e) => {
    e.preventDefault();
    const { results, gantt } = calculateFCFS(); // 1. Hitung
    showResultSection(resultFcfsSection, linkFcfs); // 2. Tampilkan Section
    displayResults("fcfs", results, gantt); // 3. Isi datanya
  });

  // SJF
  linkSjf.addEventListener("click", (e) => {
    e.preventDefault();
    const { results, gantt } = calculateSJF(); // 1. Hitung
    showResultSection(resultSjfSection, linkSjf); // 2. Tampilkan Section
    displayResults("sjf", results, gantt); // 3. Isi datanya
  });

  // RR (Pertama tampilkan input Time Quantum)
  linkRr.addEventListener("click", (e) => {
    e.preventDefault();

    hideAllSections();
    rrInputQuantum.classList.remove("hidden"); // Tampilkan input Time Quantum

    mainTitle.classList.add("hidden-title");

    removeActiveClass();
    linkRr.classList.add("active");
  });

  // Tombol "Hitung" di halaman RR
  hitungRrButton.addEventListener("click", () => {
    const quantum = parseInt(
      document.getElementById("time-quantum-input").value
    );
    if (isNaN(quantum) || quantum <= 0) {
      alert("Time Quantum harus bilangan positif!");
      return;
    }

    const { results, gantt } = calculateRR(quantum); // 1. Hitung
    showResultSection(resultRrSection, linkRr); // 2. Tampilkan Section
    displayResults("rr", results, gantt); // 3. Isi datanya
  });

  // Tombol Kembali
  backButton.addEventListener("click", () => {
    showInitialInput();
  });

  // Tampilkan input awal saat halaman pertama kali dimuat
  showInitialInput();
});