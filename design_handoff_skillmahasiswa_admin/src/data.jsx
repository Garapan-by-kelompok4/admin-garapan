/* Realistic Indonesian dummy data */
const initials = (name) => name.split(" ").slice(0, 2).map(x => x[0]).join("").toUpperCase();
const avatarClass = (seed) => "av-" + (Math.abs([...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7)) % 8);
const fmtIDR = (n) => "Rp " + n.toLocaleString("id-ID");
const fmtDate = (s) => s; // simple passthrough; strings already formatted

const MAHASISWA = [
  { id: "MH-2041", nama: "Rizky Ananda Putra",      email: "rizky.ap@std.ui.ac.id",        nim: "2006543211", prodi: "Teknik Informatika",   status: "Aktif",      daftar: "12 Mar 2025", jobs: 18, rating: 4.9 },
  { id: "MH-2042", nama: "Aulia Rahmadani Safitri", email: "aulia.rs@mail.unpad.ac.id",    nim: "140820240099", prodi: "Sistem Informasi",   status: "Aktif",      daftar: "02 Feb 2025", jobs: 24, rating: 4.8 },
  { id: "MH-2043", nama: "Muhammad Farhan Hakim",   email: "mfarhan@student.itb.ac.id",    nim: "13520014",   prodi: "Informatika",           status: "Aktif",      daftar: "27 Jan 2025", jobs: 31, rating: 5.0 },
  { id: "MH-2044", nama: "Kirana Ayu Lestari",      email: "kirana.ayu@ugm.ac.id",         nim: "21/478912/PA", prodi: "Ilmu Komputer",       status: "Suspended",  daftar: "18 Nov 2024", jobs: 7,  rating: 3.6 },
  { id: "MH-2045", nama: "Bagas Aditya Pratama",    email: "bagas.a@mhs.unhas.ac.id",      nim: "H071211042", prodi: "Teknik Informatika",   status: "Pending",    daftar: "14 Apr 2026", jobs: 0,  rating: 0 },
  { id: "MH-2046", nama: "Nadia Puspita Sari",      email: "nadia.puspita@binus.ac.id",    nim: "2502019923", prodi: "Sistem Informasi",      status: "Aktif",      daftar: "05 Okt 2024", jobs: 42, rating: 4.9 },
  { id: "MH-2047", nama: "Reza Maulana Yusuf",      email: "reza.m@mhs.its.ac.id",         nim: "05111940000098", prodi: "Teknik Informatika", status: "Aktif",     daftar: "22 Aug 2024", jobs: 29, rating: 4.7 },
  { id: "MH-2048", nama: "Salsabila Dwi Anggraini", email: "salsabila@student.undip.ac.id",nim: "21060121130001", prodi: "Sistem Komputer",   status: "Pending",    daftar: "18 Apr 2026", jobs: 0,  rating: 0 },
  { id: "MH-2049", nama: "Dimas Wahyu Prakoso",     email: "dimas.wp@mhs.unsoed.ac.id",    nim: "H1D019023",  prodi: "Informatika",           status: "Aktif",      daftar: "30 May 2024", jobs: 15, rating: 4.5 },
  { id: "MH-2050", nama: "Tiara Kusuma Wardhani",   email: "tiara.kusuma@telkomuniversity.ac.id", nim: "1301220456", prodi: "Rekayasa Perangkat Lunak", status: "Aktif", daftar: "11 Sep 2024", jobs: 22, rating: 4.8 },
];

const KLIEN = [
  { id: "CL-0918", nama: "Andika Surya",        email: "andika@kopipintar.id",     perusahaan: "Kopi Pintar Nusantara", status: "Aktif",     daftar: "08 Jan 2025", jobs: 12 },
  { id: "CL-0919", nama: "Laras Wulandari",     email: "laras@butikwulan.co.id",   perusahaan: "Butik Wulan",           status: "Aktif",     daftar: "14 Feb 2025", jobs: 6  },
  { id: "CL-0920", nama: "Bambang Setiawan",    email: "bambang@ptsinarjaya.co.id",perusahaan: "PT Sinar Jaya Sentosa", status: "Aktif",     daftar: "03 Mar 2025", jobs: 21 },
  { id: "CL-0921", nama: "Monika Permata Indah",email: "monika@cerahfoto.com",     perusahaan: "Cerah Foto Studio",     status: "Suspended", daftar: "19 Dec 2024", jobs: 4  },
  { id: "CL-0922", nama: "Yoga Adrian",         email: "yoga@rumahbatikyog.id",    perusahaan: "Rumah Batik Yog",       status: "Aktif",     daftar: "27 Apr 2025", jobs: 9  },
  { id: "CL-0923", nama: "Sinta Lukitasari",    email: "sinta.l@klinikhijau.id",   perusahaan: "Klinik Hijau",          status: "Pending",   daftar: "12 Apr 2026", jobs: 0  },
  { id: "CL-0924", nama: "Hendra Gunawan",      email: "hendra@cvmaju.co.id",      perusahaan: "CV Maju Bersama",       status: "Aktif",     daftar: "05 Jul 2024", jobs: 17 },
];

const JASA_TITLES = [
  "Jasa Pembuatan Website Company Profile",
  "Mobile App Android Kotlin untuk UMKM",
  "Desain UI/UX Aplikasi Kesehatan",
  "Landing Page Produk + Setup SEO Dasar",
  "Website E-commerce Laravel + Payment Gateway",
  "Dashboard Admin React.js Custom",
  "Bot WhatsApp CS Otomatis",
  "Optimasi Database & Query PostgreSQL",
  "Integrasi API Midtrans ke Sistem POS",
  "Revisi Desain Logo & Brand Guideline",
];

const AKTIVITAS = [
  { type: "order",  text: "Pesanan baru #ORD-2406 dari Andika Surya",         target: "Jasa Pembuatan Website Company Profile", time: "2 menit lalu",  who: "Andika Surya" },
  { type: "user",   text: "Mahasiswa baru terdaftar",                          target: "Salsabila Dwi Anggraini · Undip",         time: "14 menit lalu", who: "Salsabila Dwi A." },
  { type: "report", text: "Laporan baru masuk",                                target: "Dugaan plagiarisme pada jasa #JS-1921",   time: "36 menit lalu", who: "Hendra Gunawan" },
  { type: "order",  text: "Pesanan selesai & escrow dicairkan",               target: "Rp 3.750.000 → Muhammad Farhan H.",       time: "1 jam lalu",    who: "Muhammad Farhan H." },
  { type: "user",   text: "Klien baru terdaftar",                              target: "Sinta Lukitasari · Klinik Hijau",         time: "2 jam lalu",    who: "Sinta Lukitasari" },
  { type: "report", text: "Laporan dispute diperbarui",                        target: "#LP-0411 naik ke prioritas tinggi",       time: "3 jam lalu",    who: "Yoga Adrian" },
  { type: "order",  text: "Pesanan baru #ORD-2405",                            target: "Landing Page Produk — Kirana Ayu L.",     time: "4 jam lalu",    who: "Kirana Ayu L." },
  { type: "user",   text: "Mahasiswa diaktifkan kembali",                      target: "Kirana Ayu Lestari — UGM",                time: "5 jam lalu",    who: "Admin Sistem" },
  { type: "order",  text: "Refund diproses",                                   target: "#ORD-2380 · Rp 1.200.000",                time: "7 jam lalu",    who: "Laras Wulandari" },
  { type: "report", text: "Konten ditandai aman oleh moderator",               target: "#JS-1887 · Mobile App Android Kotlin",    time: "Kemarin",       who: "Admin Sistem" },
];

const LAPORAN = [
  { id: "LP-0415", pelapor: "Andika Surya",        terlapor: "Rizky A. Putra",       jenis: "Hasil tidak sesuai brief",  status: "Terbuka",   prioritas: "Tinggi",  tanggal: "19 Apr 2026" },
  { id: "LP-0414", pelapor: "Laras Wulandari",     terlapor: "Bagas A. Pratama",     jenis: "Komunikasi tidak responsif", status: "Diproses",  prioritas: "Sedang",  tanggal: "18 Apr 2026" },
  { id: "LP-0413", pelapor: "Hendra Gunawan",      terlapor: "Kirana Ayu L.",        jenis: "Dugaan plagiarisme",        status: "Terbuka",   prioritas: "Tinggi",  tanggal: "18 Apr 2026" },
  { id: "LP-0412", pelapor: "Yoga Adrian",         terlapor: "Reza Maulana Y.",      jenis: "Telat deadline",            status: "Diproses",  prioritas: "Sedang",  tanggal: "17 Apr 2026" },
  { id: "LP-0411", pelapor: "Monika Permata",      terlapor: "Dimas Wahyu P.",       jenis: "Hasil tidak sesuai brief",  status: "Selesai",   prioritas: "Rendah",  tanggal: "15 Apr 2026" },
  { id: "LP-0410", pelapor: "Bambang Setiawan",    terlapor: "Tiara Kusuma W.",      jenis: "Permintaan refund",         status: "Selesai",   prioritas: "Sedang",  tanggal: "14 Apr 2026" },
  { id: "LP-0409", pelapor: "Nadia Puspita",       terlapor: "Hendra Gunawan",       jenis: "Pembayaran tertunda",       status: "Ditolak",   prioritas: "Rendah",  tanggal: "12 Apr 2026" },
  { id: "LP-0408", pelapor: "Aulia Rahmadani",     terlapor: "CV Maju Bersama",      jenis: "Pelanggaran ToS",           status: "Diproses",  prioritas: "Tinggi",  tanggal: "11 Apr 2026" },
];

const KONTEN_FLAG = [
  { id: "JS-1921", judul: "Jasa Pembuatan Website Company Profile Full Package", pemilik: "Rizky A. Putra",       kategori: "Web Development", laporan: 3, posting: "14 Apr 2026", status: "Ditinjau" },
  { id: "JS-1918", judul: "Mobile App Android Kotlin untuk UMKM — Murah Meriah",  pemilik: "Bagas A. Pratama",     kategori: "Mobile Dev",      laporan: 5, posting: "11 Apr 2026", status: "Ditinjau" },
  { id: "JS-1914", judul: "Desain UI/UX Aplikasi Kesehatan",                       pemilik: "Aulia R. Safitri",     kategori: "UI/UX Design",    laporan: 2, posting: "09 Apr 2026", status: "Aman" },
  { id: "JS-1909", judul: "Script Copy-Paste untuk Tugas Kuliah",                  pemilik: "Akun Dihapus",         kategori: "Lain-lain",       laporan: 12,posting: "05 Apr 2026", status: "Dihapus" },
  { id: "JS-1905", judul: "Landing Page + Setup Google Ads Otomatis",             pemilik: "Dimas Wahyu P.",        kategori: "Digital Mkt",     laporan: 1, posting: "04 Apr 2026", status: "Disembunyikan" },
  { id: "JS-1901", judul: "Bot WhatsApp Auto-Reply 24/7",                          pemilik: "Reza Maulana Y.",      kategori: "Automation",      laporan: 4, posting: "02 Apr 2026", status: "Ditinjau" },
];

const TRANSAKSI = [
  { id: "TRX-84201", klien: "Andika Surya",        mhs: "Rizky A. Putra",      jasa: "Website Company Profile",         nominal: 4500000, status: "Ditahan",   tanggal: "19 Apr 2026" },
  { id: "TRX-84199", klien: "Laras Wulandari",     mhs: "Aulia R. Safitri",    jasa: "Desain UI/UX Aplikasi",           nominal: 3200000, status: "Dicairkan", tanggal: "18 Apr 2026" },
  { id: "TRX-84195", klien: "Bambang Setiawan",    mhs: "Muhammad Farhan H.",  jasa: "Dashboard Admin React.js",        nominal: 7800000, status: "Dicairkan", tanggal: "17 Apr 2026" },
  { id: "TRX-84190", klien: "Monika Permata",      mhs: "Dimas Wahyu P.",      jasa: "Landing Page + SEO Dasar",        nominal: 1500000, status: "Refund",    tanggal: "15 Apr 2026" },
  { id: "TRX-84187", klien: "Yoga Adrian",         mhs: "Reza Maulana Y.",     jasa: "Bot WhatsApp CS Otomatis",        nominal: 2200000, status: "Ditahan",   tanggal: "14 Apr 2026" },
  { id: "TRX-84183", klien: "Hendra Gunawan",      mhs: "Nadia Puspita S.",    jasa: "E-commerce Laravel + Payment GW", nominal: 12500000,status: "Ditahan",   tanggal: "13 Apr 2026" },
  { id: "TRX-84178", klien: "Andika Surya",        mhs: "Tiara Kusuma W.",     jasa: "Optimasi Database PostgreSQL",    nominal: 2800000, status: "Dicairkan", tanggal: "12 Apr 2026" },
  { id: "TRX-84174", klien: "Laras Wulandari",     mhs: "Muhammad Farhan H.",  jasa: "Revisi Logo & Brand Guideline",   nominal:  950000, status: "Dicairkan", tanggal: "10 Apr 2026" },
];

const ARTIKEL = [
  { id: "ART-021", judul: "5 Tips Menyusun Portofolio Mahasiswa IT yang Dilirik Klien", status: "Published", tanggal: "15 Apr 2026", views: 3241, kategori: "Karier" },
  { id: "ART-020", judul: "Cara Menentukan Harga Jasa Freelance saat Masih Kuliah",      status: "Published", tanggal: "08 Apr 2026", views: 5892, kategori: "Keuangan" },
  { id: "ART-019", judul: "Panduan Lengkap Fitur Escrow SkillMahasiswa",                  status: "Published", tanggal: "28 Mar 2026", views: 1760, kategori: "Panduan" },
  { id: "ART-018", judul: "Cerita Sukses: Dari Tugas Kuliah Menjadi Klien Pertama",       status: "Draft",     tanggal: "20 Apr 2026", views: 0,    kategori: "Inspirasi" },
  { id: "ART-017", judul: "10 Kesalahan Umum Freelancer Pemula (dan Cara Menghindarinya)", status: "Published", tanggal: "12 Mar 2026", views: 4502, kategori: "Tips" },
  { id: "ART-016", judul: "Mengenal Kontrak Kerja Proyek untuk Mahasiswa IT",              status: "Draft",     tanggal: "18 Apr 2026", views: 0,    kategori: "Legal" },
];

const CHAT_SESSIONS = [
  { id: "S-01", nama: "Andika Surya",       role: "Klien",     last: "Baik, saya tunggu konfirmasinya ya kak", time: "baru saja", unread: 2, online: true,  avIdx: 1 },
  { id: "S-02", nama: "Rizky Ananda Putra", role: "Mahasiswa", last: "Dokumen sudah saya kirim via email",     time: "2 menit",   unread: 1, online: true,  avIdx: 0 },
  { id: "S-03", nama: "Hendra Gunawan",     role: "Klien",     last: "Halo min, saya mau komplain soal…",       time: "8 menit",   unread: 3, online: true,  avIdx: 4 },
  { id: "S-04", nama: "Nadia Puspita Sari", role: "Mahasiswa", last: "Terima kasih infonya, sangat membantu",   time: "34 menit",  unread: 0, online: false, avIdx: 6 },
  { id: "S-05", nama: "Laras Wulandari",    role: "Klien",     last: "Oke, saya proses dulu ya pembayarannya",  time: "1 jam",     unread: 0, online: false, avIdx: 3 },
  { id: "S-06", nama: "Aulia Rahmadani",    role: "Mahasiswa", last: "Apakah ada kendala pada akun saya?",       time: "3 jam",     unread: 0, online: true,  avIdx: 2 },
  { id: "S-07", nama: "Bambang Setiawan",   role: "Klien",     last: "Tolong dibantu untuk refund nya min",     time: "Kemarin",   unread: 0, online: false, avIdx: 5 },
];

const CHAT_MESSAGES = {
  "S-01": [
    { from: "them", text: "Halo admin, saya ingin tanya mengenai proses refund untuk pesanan #ORD-2380", time: "10:12" },
    { from: "me",   text: "Halo kak Andika 👋 Baik, untuk pesanan #ORD-2380 saat ini statusnya masih dalam proses verifikasi kendala. Mohon ditunggu maksimal 1x24 jam ya kak.", time: "10:14" },
    { from: "them", text: "Kira-kira kendalanya apa ya min? Sudah 3 hari saya belum menerima file-nya", time: "10:15" },
    { from: "me",   text: "Saya cek dulu detailnya sebentar ya kak. Mohon tunggu 1 menit.", time: "10:16" },
    { from: "me",   text: "Kak, dari sisi mahasiswa (Dimas) terdapat keterlambatan pengiriman dan beliau sudah meminta perpanjangan deadline. Apakah kakak sudah menerima notifikasi perpanjangan?", time: "10:18" },
    { from: "them", text: "Belum pernah ada notifikasi soal perpanjangan sama sekali min", time: "10:19" },
    { from: "them", text: "Baik, saya tunggu konfirmasinya ya kak", time: "10:20" },
  ],
};

const NOTIF = [
  { type: "report", title: "Laporan prioritas tinggi baru", body: "LP-0415 · Andika Surya melaporkan Rizky A.P.",    time: "2 menit" },
  { type: "order",  title: "Transaksi nominal besar",       body: "TRX-84183 · Rp 12.500.000 · escrow ditahan",        time: "23 menit" },
  { type: "chat",   title: "3 sesi chat menunggu",          body: "Hendra Gunawan butuh balasan",                       time: "1 jam" },
  { type: "system", title: "Backup harian berhasil",        body: "Semua data tersimpan ke cloud storage",              time: "6 jam" },
];

Object.assign(window, {
  initials, avatarClass, fmtIDR, fmtDate,
  MAHASISWA, KLIEN, JASA_TITLES, AKTIVITAS, LAPORAN, KONTEN_FLAG, TRANSAKSI, ARTIKEL, CHAT_SESSIONS, CHAT_MESSAGES, NOTIF,
});
