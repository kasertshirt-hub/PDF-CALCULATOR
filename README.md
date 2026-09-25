# # Kaser Printing PDF Calculator v5.0.20 — ELECTRON ONLY

Versi ini **tidak menggunakan Python, PyInstaller, backend.py, atau executable backend**. Seluruh engine PDF berjalan di sisi Electron/Chromium menggunakan `pdfjs-dist` dan `pdf-lib`.

## Fitur
- Preview PDF dan navigasi halaman
- Analisis BW / warna langsung di Electron
- Perhitungan harga BW dan warna
- Filter halaman BW / warna
- Paksa semua halaman menjadi BW / kembali ke hasil normal
- Pisahkan PDF BW / Warna
- Nota, PNG, Copy WhatsApp
- Pengaturan toko: logo, nama, alamat, WhatsApp, footer
- Riwayat transaksi dan backup JSON
- Update aplikasi

## Build Windows
1. Install Node.js LTS.
2. Jalankan `npm install`.
3. Jalankan `build\build_windows.bat` atau `npm run build:win`.
4. Installer ada di folder `dist`.

Data pengguna disimpan di `%APPDATA%\KaserPrinting\PDFPrintCalculator\data.json`, terpisah dari kode aplikasi.


### Icon Aplikasi
Icon aplikasi menggunakan `build/icon.ico` untuk window Electron, shortcut Desktop/Start Menu, installer, dan uninstaller.
