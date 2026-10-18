# Cliproom

Web app untuk mengambil video/audio dari tautan media sosial publik sebagai bahan riset dan produksi konten.
Alur: **Tempel link → Ambil → Preview → Download**.

Gunakan hanya untuk konten yang kamu miliki, punya izin untuk mengunduh/menggunakan, atau memang tersedia untuk penggunaan ulang.
Aplikasi ini tidak melewati login, paywall, DRM, atau akses konten privat.

## Stack

Next.js 15 (App Router) · TypeScript 6 · Tailwind CSS 3 · Zod · Lucide · Vitest

> TypeScript harus 6.x: Next.js 15 belum mendukung TypeScript 7.

## Setup

```bash
npm install
cp .env.example .env.local   # lalu isi RAPIDAPI_KEY
npm run dev                  # http://localhost:3000
```

Perintah lain: `npm run typecheck`, `npm test`, `npm run build`, `npm start`.

## Environment variables

| Variabel | Wajib | Keterangan |
| --- | --- | --- |
| `RAPIDAPI_KEY` | ya | Key RapidAPI. Hanya dipakai di server. Gunakan key baru yang sudah di-rotate. |
| `RAPIDAPI_HOST` | tidak | Default `social-download-all-in-one.p.rapidapi.com`. |
| `RAPIDAPI_ENDPOINT` | tidak | URL endpoint lengkap (harus https). Default `https://<host>/v1/social/autolink`. |

Jika `RAPIDAPI_KEY` kosong, `/api/resolve` menjawab `503 not_configured` dan UI menampilkan "Layanan belum dikonfigurasi".

## Endpoint RapidAPI yang dipakai — PERLU DIKONFIRMASI

Adapter (`src/lib/rapidapi.ts`) memanggil `POST {RAPIDAPI_ENDPOINT}` dengan body `{ "url": "<link>" }` dan header
`X-RapidAPI-Host` + `X-RapidAPI-Key`.

Method dan path `POST /v1/social/autolink` **belum diverifikasi dari dokumentasi resmi RapidAPI**. Nilai itu hanya ditemukan
di sumber pihak ketiga (paket MCP wrapper untuk API yang sama). Buka halaman endpoint di RapidAPI, cocokkan method, path,
parameter, dan bentuk respons, lalu sesuaikan `RAPIDAPI_ENDPOINT` (atau adapter) bila berbeda.

Integrasi **belum pernah diuji dengan key valid**.

## Arsitektur singkat

- `POST /api/resolve` (`src/app/api/resolve/route.ts`): validasi URL → panggil RapidAPI → normalisasi → kembalikan data aman untuk UI.
  Ada rate limit sederhana di memori (20 request/menit/IP; per instance, ganti dengan store bersama di serverless).
- `src/lib/url.ts`: validator (http/https saja, blok localhost/IP privat/loopback/link-local IPv4 & IPv6, tanpa kredensial, maks 2048 karakter).
- `src/lib/normalize.ts`: respons provider → `ResolvedMedia`. Durasi utama dianggap **milidetik**; durasi per-item media dianggap **detik** dan tidak dikonversi lagi.
- `src/lib/errors.ts`: kode error → pesan Bahasa Indonesia + status HTTP. Secret, header, dan stack trace tidak pernah dikirim ke browser.
- Download memakai URL media dari API langsung di browser. Tidak ada proxy file, sehingga tidak ada permukaan SSRF baru.

## Batasan

- Dukungan platform mengikuti apa yang berhasil dikembalikan provider; tidak semua link akan berhasil.
- URL media CDN bisa kedaluwarsa. Bila gagal dibuka, ambil ulang dari link sumber.
- Atribut `download` sering diabaikan browser untuk URL lintas-origin; media bisa terbuka di tab baru lalu disimpan manual.
- Preview video langsung bisa gagal (hotlink/CORS/format); UI jatuh kembali ke thumbnail.
- Tidak ada riwayat; tidak ada data yang disimpan.

## Troubleshooting

| Gejala | Kemungkinan penyebab |
| --- | --- |
| "Layanan belum dikonfigurasi" | `RAPIDAPI_KEY` kosong/placeholder, atau `RAPIDAPI_ENDPOINT` bukan https. |
| "Kuota layanan habis atau konfigurasi API bermasalah" | Key salah, belum subscribe, atau kuota habis (401/402/403 dari provider). |
| "Link ini belum bisa diproses" | Konten privat/dihapus, platform tidak didukung, atau path/method endpoint salah (404/422). |
| "Layanan sedang sibuk" | Rate limit RapidAPI (429) atau rate limit internal. |
| Build gagal soal TypeScript | Pastikan `typescript@^6` terpasang. |
