# Dua Putra Srikandi (DPS) - Content Management System (CMS)

A modern, responsive Content Management System web application built with **Next.js 16 (App Router & Turbopack)**, **Tailwind CSS**, and a tailored Figma Design System for **Dua Putra Srikandi**.

---

## 🎨 Design System & Color Palette

### 1. Typography
- Primary Font: **Open Sans** (`font-sans`)

### 2. Color Tokens

| Category | Token Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Brand** | `G1` | `#0A9863` | Primary brand green, buttons, active highlights |
| | `G2` | `#06D07A` | Secondary brand green accent |
| | `G3` | `#034F04` | Deep forest brand green |
| | `background` | `#F8F4F0` | Warm stone background for inputs & page containers |
| **Dark** | `dark` | `#110D31` | High-contrast dark text and headings |
| **White** | `white-100` | `#FFFFFF` | Card surfaces & clean white components |
| | `white-90` | `#F6F6F6` | Secondary light surface background |
| | `white-80` | `#ECECEC` | Soft borders & dividers |
| | `white-70` | `#E9E9E9` | Outlines & subtle borders |
| **State** | `red-state` | `#F94C4C` | Error alerts, delete buttons, logout |
| | `green-state` | `#57C439` | Success indicators & badges |
| | `blue-state` | `#4C94F9` | Info notifications & blue tags |
| | `yellow-state` | `#FFD84A` | Warning banners & status badges |

---

## 📁 Project Architecture

```
dps-cms/
├── public/
│   └── icons/                # SVG Mask icons (Dashboard, User, Edit, Delete, etc.)
├── src/
│   ├── app/
│   │   ├── components/       # Interactive component testbed & showcase page (/components)
│   │   ├── kelola-pengguna/  # User Management page (/kelola-pengguna)
│   │   ├── globals.css       # Design tokens, CSS variables, & custom button styles
│   │   ├── layout.tsx        # Root layout with Open Sans Google font
│   │   └── page.tsx          # Home page
│   ├── components/
│   │   ├── common/           # Shared reusable utilities
│   │   ├── layout/
│   │   │   ├── navbar.tsx    # Header navbar with user profile & logout
│   │   │   └── sidebar.tsx   # Sidebar navigation with active/inactive button states
│   │   └── ui/
│   │       ├── badge.tsx             # Status indicators & color badges
│   │       ├── button.tsx            # Button with Figma variants & connected pills
│   │       ├── descriptionBox.tsx    # Multiline textarea with rounded-2xl style
│   │       ├── dropdown.tsx          # 2-pill segmented dropdown with search & tags
│   │       ├── inputBox.tsx          # Pill input box (rounded-[120px]) with icon support
│   │       ├── mediaCard.tsx         # Media asset preview card
│   │       ├── notification.tsx      # Toast notifications (success, error, default)
│   │       ├── pagination.tsx        # Segmented pagination with unique buttons
│   │       ├── uploadFile.tsx        # Drag-and-drop file upload with media select modal
│   │       └── modal/
│   │           ├── deleteConfirmation.tsx # Deletion confirmation dialog
│   │           └── mediaSelectModal.tsx   # Media library picker modal
│   ├── constants/            # Global constants & TypeScript color maps
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility functions
│   ├── services/             # API services
│   ├── shared/               # Mock data & fallback APIs
│   └── types/                # TypeScript interface declarations
├── package.json
└── tsconfig.json
```

---

## 🧩 Components & Features

### 1. `Button` (`src/components/ui/button.tsx`)
Supports multiple Figma variants and zero-gap connected pill geometry:
- **`fill`**: Solid brand green (`#0A9863`) with white text and smooth opacity transition on hover.
- **`stroke`**: Outlined brand green button with a subtle 5% green tint on hover.
- **`glass`**: Translucent button designed for backdrop-filtered surfaces.
- **`ghost-green`**: Minimalist transparent button with green text, fading on hover.
- **`ghost-white`**: Minimalist transparent button with white text.
- **`unique-green`**: Segmented connected 2-pill button in solid green.
- **`unique-stroke`**: Segmented connected 2-pill button with outline styling.
- **`unique-white`**: Segmented connected 2-pill button with pure `#FFFFFF` background.
- **`unique-red`**: Segmented connected 2-pill button for danger/logout actions.

### 2. `InputBox` & `DescriptionBox`
- **`InputBox`**: Styled with `bg-brand-background` (`#F8F4F0`), `rounded-[120px]`, `text-dark`, and left/right icon mask support.
- **`DescriptionBox`**: Styled with `bg-brand-background` and `rounded-2xl` for textarea inputs.

### 3. `Dropdown` (`src/components/ui/dropdown.tsx`)
- Connected 2-pill design with `gap-0`:
  - **Left Pill**: Search input, placeholder, and dismissable multi-select chips (`text-xs font-semibold`).
  - **Right Pill**: Connected circular segment with a green outline (`outline-g1`) and rotating arrow indicator.
- Searchable options panel with green checkmark highlights.

### 4. `Pagination` (`src/components/ui/pagination.tsx`)
- Info counter: `Menampilkan X dari Y Data`.
- Connected **"Sebelumnya"** (`unique-stroke`) and **"Selanjutnya"** (`unique-green`) buttons.
- Circular numbered page indicators.

### 5. `Navbar` & `Sidebar`
- **`Navbar`**: Top bar with brand branding, Super Admin account indicator, and red logout action.
- **`Sidebar`**: Sidebar card (`rounded-[32px]`) managing menu states seamlessly via `fill` (active) and `ghost-green` (inactive).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm / pnpm / yarn

### Installation & Run Dev Server

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Key Pages
- **Interactive Component Showcase**: [http://localhost:3000/components](http://localhost:3000/components)
- **User Management Page**: [http://localhost:3000/kelola-pengguna](http://localhost:3000/kelola-pengguna)

### Build for Production

```bash
npm run build
npm run start
```
