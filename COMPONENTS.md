# 📦 HikeBook UI Components Documentation

Dokumentasi lengkap untuk UI Components yang tersedia di HikeBook.

---

## 🎯 Table of Contents

1. [Hero Component](#hero-component)
2. [Card Component](#card-component)
3. [Button Component](#button-component)
4. [Dropdown Component](#dropdown-component)

---

## 🦸 Hero Component

Hero section yang dapat disesuaikan untuk halaman landing atau header halaman.

### 📍 Lokasi File
`views/components/hero.ejs`

### 🎨 Variants
- `default` - Hero standar dengan background gradient
- `centered` - Hero dengan konten di tengah
- `minimal` - Hero dengan padding lebih kecil
- `with-background` - Hero dengan background image

### 📝 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heroTitle` | String | 'Welcome' | Judul utama hero |
| `heroSubtitle` | String | '' | Subtitle/deskripsi hero |
| `heroVariant` | String | 'default' | Variant hero (default, centered, minimal) |
| `heroBgColor` | String | gradient hijau | Background color/gradient |
| `heroBgImage` | String | '' | URL background image |
| `heroTextAlign` | String | 'center' | Text alignment (left, center, right) |
| `heroHeight` | String | 'auto' | Tinggi hero (auto, 400px, 100vh, etc) |
| `heroShowButton` | Boolean | true | Tampilkan button atau tidak |
| `heroButtonText` | String | 'Get Started' | Text button |
| `heroButtonLink` | String | '#' | Link button |

### 💡 Contoh Penggunaan

```ejs
<%- include('components/hero', {
  heroTitle: 'Booking Pendakian Gunung Gede Pangrango',
  heroSubtitle: 'Pilih jalur pendakian yang sesuai dengan kemampuan Anda',
  heroVariant: 'centered',
  heroShowButton: true,
  heroButtonText: 'Lihat Semua Jalur',
  heroButtonLink: '#packages',
  heroHeight: '500px'
}) %>
```

---

## 🃏 Card Component

Komponen card yang fleksibel untuk menampilkan konten dalam kotak.

### 📍 Lokasi File
`views/components/card.ejs`

### 🎨 Variants
- `default` - Card standar dengan header dan border
- `horizontal` - Card dengan layout horizontal
- `featured` - Card dengan border highlight
- `simple` - Card minimalis tanpa border tebal

### 📝 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `cardTitle` | String | '' | Judul card |
| `cardContent` | String (HTML) | '' | Konten utama card (mendukung HTML) |
| `cardImage` | String | '' | URL gambar card |
| `cardBadge` | String | '' | Text badge |
| `cardBadgeColor` | String | 'primary' | Warna badge (primary, success, warning, danger, info) |
| `cardFooter` | String (HTML) | '' | Konten footer card |
| `cardVariant` | String | 'default' | Variant card |
| `cardHoverable` | Boolean | true | Aktifkan hover effect |
| `cardClass` | String | '' | Custom CSS class |

### 💡 Contoh Penggunaan

```ejs
<!-- Card Sederhana -->
<%- include('components/card', {
  cardTitle: 'Jalur Cibodas',
  cardBadge: 'Sedang',
  cardBadgeColor: 'warning',
  cardContent: '<p>Jalur klasik dengan pemandangan air terjun</p>',
  cardVariant: 'default'
}) %>

<!-- Card dengan Footer -->
<%- include('components/card', {
  cardTitle: 'Tentang Gunung Gede',
  cardContent: '<p>Informasi lengkap tentang gunung...</p>',
  cardFooter: `
    <%- include('components/button', {
      btnText: 'Selengkapnya',
      btnVariant: 'primary'
    }) %>
  `,
  cardVariant: 'featured'
}) %>
```

---

## 🔘 Button Component

Komponen button dengan berbagai style dan ukuran.

### 📍 Lokasi File
`views/components/button.ejs`

### 🎨 Variants
- `primary` - Button hijau utama
- `secondary` - Button abu-abu
- `success` - Button hijau terang
- `danger` - Button merah
- `warning` - Button kuning
- `info` - Button biru
- `outline-primary` - Button outline hijau
- `outline-secondary` - Button outline abu-abu
- `outline-danger` - Button outline merah

### 📏 Sizes
- `small` - Button kecil
- `medium` - Button sedang (default)
- `large` - Button besar
- `block` - Button full width

### 📝 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `btnText` | String | 'Button' | Text button |
| `btnVariant` | String | 'primary' | Variant button |
| `btnSize` | String | 'medium' | Ukuran button |
| `btnLink` | String | '#' | URL link (untuk type='link') |
| `btnIcon` | String | '' | Icon/emoji button |
| `btnIconPosition` | String | 'left' | Posisi icon (left, right) |
| `btnType` | String | 'link' | Type button (link, button, submit) |
| `btnDisabled` | Boolean | false | Disabled state |
| `btnClass` | String | '' | Custom CSS class |

### 💡 Contoh Penggunaan

```ejs
<!-- Button Link -->
<%- include('components/button', {
  btnText: 'Booking Sekarang',
  btnVariant: 'primary',
  btnSize: 'large',
  btnIcon: '🏔️',
  btnLink: '/booking'
}) %>

<!-- Button Submit Form -->
<%- include('components/button', {
  btnText: 'Submit',
  btnVariant: 'success',
  btnType: 'submit'
}) %>

<!-- Button Outline -->
<%- include('components/button', {
  btnText: 'Batal',
  btnVariant: 'outline-danger',
  btnSize: 'small'
}) %>

<!-- Button Full Width -->
<%- include('components/button', {
  btnText: 'Login',
  btnVariant: 'primary',
  btnSize: 'block'
}) %>
```

---

## 📋 Dropdown Component

Komponen dropdown yang interaktif dengan JavaScript.

### 📍 Lokasi File
`views/components/dropdown.ejs`

### 🎨 Variants
- `default` - Dropdown standar
- `primary` - Dropdown dengan border hijau
- `minimal` - Dropdown minimalis (underline only)

### 📝 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dropdownLabel` | String | 'Select Option' | Label dropdown |
| `dropdownOptions` | Array | [] | Array opsi dropdown |
| `dropdownSelected` | String | '' | Nilai yang dipilih |
| `dropdownPlaceholder` | String | 'Choose...' | Placeholder text |
| `dropdownVariant` | String | 'default' | Variant dropdown |
| `dropdownDisabled` | Boolean | false | Disabled state |
| `dropdownId` | String | auto-generated | ID unik dropdown |
| `dropdownClass` | String | '' | Custom CSS class |

### 📝 Format Options

```javascript
// String sederhana
['Option 1', 'Option 2', 'Option 3']

// Object dengan value dan label
[
  { value: 'opt1', label: 'Option 1' },
  { value: 'opt2', label: 'Option 2' }
]

// Dengan divider
[
  'Option 1',
  'Option 2',
  '---',  // Divider
  'Option 3'
]
```

### 💡 Contoh Penggunaan

```ejs
<!-- Dropdown Sederhana -->
<%- include('components/dropdown', {
  dropdownLabel: 'Pilih Gunung:',
  dropdownPlaceholder: 'Pilih gunung...',
  dropdownOptions: [
    'Gunung Gede Pangrango',
    'Gunung Semeru',
    'Gunung Rinjani'
  ]
}) %>

<!-- Dropdown dengan Value/Label -->
<%- include('components/dropdown', {
  dropdownLabel: 'Tingkat Kesulitan:',
  dropdownVariant: 'primary',
  dropdownOptions: [
    { value: 'mudah', label: 'Mudah' },
    { value: 'sedang', label: 'Sedang' },
    { value: 'sulit', label: 'Sulit' }
  ],
  dropdownSelected: 'sedang'
}) %>
```

### 🎯 Event Handling

Dropdown mengirim custom event `dropdown-change` ketika opsi dipilih:

```javascript
const dropdown = document.getElementById('dropdown-id');
dropdown.addEventListener('dropdown-change', function(e) {
  console.log('Selected value:', e.detail.value);
  console.log('Selected label:', e.detail.label);
});
```

---

## 🎨 Color Palette

Warna yang digunakan di komponen:

```css
Primary Green: #2c5f2d
Light Green: #97bc62
Success: #28a745
Warning: #ffc107
Danger: #dc3545
Info: #17a2b8
Secondary: #6c757d
```

---

## 📱 Responsive Design

Semua komponen sudah responsive dan akan menyesuaikan dengan ukuran layar:
- Desktop: Layout penuh
- Tablet: Layout menyesuaikan
- Mobile: Layout vertikal/stack

---

## 🚀 Tips Penggunaan

1. **Nested Components**: Anda bisa memasukkan komponen dalam komponen lain (seperti button di dalam card footer)

2. **Custom Styling**: Tambahkan `customClass` atau inline style untuk styling tambahan

3. **HTML Content**: Props seperti `cardContent` dan `cardFooter` mendukung HTML

4. **Accessibility**: Semua komponen sudah include ARIA attributes untuk accessibility

---

## 📞 Bantuan

Jika ada pertanyaan atau masalah dengan komponen, silakan buka issue di repository atau hubungi tim developer.

Happy Coding! 🎉
