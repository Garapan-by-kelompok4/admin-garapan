export const formatTime = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

export const formatDateLabel = (dateStr: string) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
};

export const quickReplies = [
  "Halo, ada yang bisa kami bantu di Pusat Bantuan GARAPAN?",
  "Mohon tunggu sebentar ya, kami sedang memeriksa detail transaksi Anda.",
  "Terima kasih atas laporannya. Kasus ini telah diteruskan ke tim moderasi.",
  "Apakah kendala Anda sudah terselesaikan?",
];
