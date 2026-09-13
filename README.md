# Dua Putra Srikandi (DPS) - Content Management System (CMS)

A responsive Content Management System web application engineered with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4, built to administrative standards for Dua Putra Srikandi.

---

## Design System and Color Palette

### 1. Typography
- Primary Typeface: Open Sans (`font-sans`)

### 2. Color Tokens

| Category | Token Name | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| Brand | `G1` | `#0A9863` | Primary brand green, interactive controls, active highlights |
| | `G2` | `#06D07A` | Secondary brand green accent |
| | `G3` | `#034F04` | Deep forest brand green |
| | `background` | `#F8F4F0` | Warm stone background for inputs, textareas, and page containers |
| Dark | `dark` | `#110D31` | High-contrast dark text and headings |
| White | `white-100` | `#FFFFFF` | Card surfaces and high-contrast components |
| | `white-90` | `#F6F6F6` | Secondary light surface background |
| | `white-80` | `#ECECEC` | Soft borders and dividers |
| | `white-70` | `#E9E9E9` | Outlines and subtle card borders |
| State | `red-state` | `#F94C4C` | Destructive alerts, delete confirmations, logout actions |
| | `green-state` | `#57C439` | Success indicators, published badges |
| | `blue-state` | `#4C94F9` | Informational notifications, category tags |
| | `yellow-state` | `#FFD84A` | Warning banners and draft status badges |

---

## Project Architecture

```
dps-cms/
├── public/
│   ├── icons/                    # SVG mask icons (Dashboard, Users, Products, Services, etc.)
│   ├── favicon.ico               # Application favicon
│   └── dps-logo-icon-white.png   # Brand identity icon asset
├── src/
│   ├── app/
│   │   ├── api/                  # Internal Next.js Route Handlers
│   │   ├── components/           # Interactive component testbed and showcase (/components)
│   │   ├── dashboard/            # Analytical dashboard and metrics overview (/dashboard)
│   │   ├── kelola-artikel/       # Article management (/kelola-artikel, /tambah, /[id])
│   │   ├── kelola-konten/        # Homepage, About, and Company details management (/kelola-konten)
│   │   ├── kelola-layanan/       # Service offerings management (/kelola-layanan, /tambah, /[id])
│   │   ├── kelola-media/         # Centralized Media Library and VPS assets (/kelola-media)
│   │   ├── kelola-pengguna/      # Role-based user access management (/kelola-pengguna)
│   │   ├── kelola-produk/        # Product catalog management (/kelola-produk, /tambah, /[id])
│   │   ├── kelola-seo/           # Route-level SEO and Analytics management (/kelola-seo)
│   │   ├── globals.css           # Design tokens, CSS variables, and utility definitions
│   │   ├── layout.tsx            # Root layout configuring Open Sans font and metadata
│   │   └── page.tsx              # Administrator authentication portal (Login)
│   ├── components/
│   │   ├── card/                 # Specialized presentation cards (Gallery, Testimonials)
│   │   ├── common/               # Shared utilities
│   │   ├── form/                 # Multi-section entity management forms and tab contents
│   │   ├── layout/
│   │   │   ├── navbar.tsx        # Top navigation header with profile context and session controls
│   │   │   └── sidebar.tsx       # Primary navigation sidebar with segmented active states
│   │   ├── modal/
│   │   │   ├── connectGaModal.tsx        # Google Analytics configuration modal
│   │   │   ├── deleteConfirmation.tsx    # Deletion confirmation modal dialog
│   │   │   ├── editPageMetaModal.tsx     # Route metadata editor modal
│   │   │   ├── manageUserModal.tsx       # User creation and modification modal
│   │   │   └── mediaSelectModal.tsx      # Media picker modal integrated with storage API
│   │   └── ui/
│   │       ├── articleEditor.tsx         # Rich-text editorial composition component
│   │       ├── badge.tsx                 # Status indicators and categorical pill tags
│   │       ├── button.tsx                # Multi-variant buttons with connected pill geometry
│   │       ├── descriptionBox.tsx        # Multiline textarea with stone background styling
│   │       ├── dropdown.tsx              # Connected two-pill segmented dropdown with search
│   │       ├── iconButton.tsx            # Circular and icon-based action buttons
│   │       ├── infoButton.tsx            # Contextual informational popover triggers
│   │       ├── inputBox.tsx              # Rounded pill input with mask icon support
│   │       ├── mediaCard.tsx             # Media library asset card with copy and action menus
│   │       ├── notification.tsx          # Toast notification alerts
│   │       ├── pagination.tsx            # Segmented pagination with range indicators
│   │       ├── sectionHeading.tsx        # Standardized page section headers
│   │       └── uploadFile.tsx            # Drag-and-drop file uploader with video and image preview
│   ├── constants/                # Global configuration and type maps
│   ├── hooks/                    # Custom React lifecycle and state hooks
│   ├── lib/                      # Core helper functions and utilities
│   ├── services/                 # External service clients
│   ├── shared/                   # Shared API client implementations and query helpers
│   └── types/                    # TypeScript interfaces and type definitions
├── package.json
└── tsconfig.json
```

---

## Core Management Modules

### 1. Authentication (`/`)
- Secure administrator sign-in portal.
- Credential validation with encrypted password comparison.
- Role inspection routing users directly to the administrative dashboard.

### 2. Dashboard (`/dashboard`)
- Metric counters summarizing total products, published services, active articles, and media files.
- Quick navigation shortcuts to core administrative workflows.

### 3. Content Management (`/kelola-konten`)
- Tabbed interface covering Beranda (Homepage), Tentang (About), and Profil Perusahaan (Company Profile).
- Banner Hero customizer with dual support for hero photographs and MP4 video backdrops.
- Dynamic statistical counters, company values, vision/mission, and FAQ legal items using standardized input components.

### 4. Product Management (`/kelola-produk`)
- Product catalog data table featuring search filters, category tags, and pagination.
- Create (`/tambah`) and Edit (`/[id]`) views supporting:
  - Base information (Name, Slug, Category, Summary).
  - Dynamic technical specification tables.
  - Multi-image gallery attachments with Media Library selection.
  - Application guidelines and downloadable documentation.

### 5. Service Management (`/kelola-layanan`)
- Full lifecycle management of company service offerings.
- Detailed workflow processes, key advantages, and visual attachments.

### 6. Article Management (`/kelola-artikel`)
- Editorial publication module with rich-text composition (`ArticleEditor`).
- Slug generation, publication state toggling (Draft vs Published), categories, and cover media integration.

### 7. Media Library (`/kelola-media`)
- Integrated media management backed by dedicated VPS file storage.
- Single and multi-file drag-and-drop uploads.
- Automated ZIP archive ingestion with server-side extraction and WebP optimization.
- Instant copy-to-clipboard URL functionality, filtering, and media asset deletion.

### 8. SEO and Analytics (`/kelola-seo`)
- Route-by-route metadata management (Meta Title, Meta Description, Keywords, Canonical URLs).
- Open Graph social share image attachments.
- Google Analytics (GA4) measurement ID integration and status tracking.

### 9. User Management (`/kelola-pengguna`)
- Role-based user control (Super Admin, Admin).
- User provisioning, modification, and password reset flows.

---

## Component Specifications

### 1. Button (`src/components/ui/button.tsx`)
- Standard Variants:
  - `fill`: Solid brand green (`#0A9863`) with white text and smooth hover state.
  - `stroke`: Outlined brand green button with soft green hover background tint.
  - `glass`: Translucent button styled for backdrop-filtered surfaces.
  - `ghost-green`: Transparent button with green text and hover transition.
  - `ghost-white`: Transparent button with white text for dark backdrops.
- Connected Pill Geometry:
  - `unique-green`: Two-pill segmented button in solid brand green.
  - `unique-stroke`: Two-pill segmented button with outline styling.
  - `unique-white`: Two-pill segmented button with crisp white background.
  - `unique-red`: Two-pill segmented button for danger and deletion actions.

### 2. InputBox and DescriptionBox
- `InputBox`: Rounded pill form control (`rounded-[120px]`) with `bg-brand-background` (`#F8F4F0`), smooth focus transition to white background, and SVG mask icon support.
- `DescriptionBox`: Multi-line textarea styled consistently with `bg-brand-background`, rounded geometry, and focused border treatment.

### 3. Dropdown (`src/components/ui/dropdown.tsx`)
- Connected two-pill structure:
  - Left Pill: Search input, selection placeholder, and removable selection chips.
  - Right Pill: Connected circular action segment with rotating indicator.
- Searchable options panel with keyboard navigation and active checkmark highlights.

### 4. UploadFile (`src/components/ui/uploadFile.tsx`)
- Multi-format ingestion supporting image and video files.
- Context-aware preview rendering:
  - Image previews with responsive scaling.
  - Video previews (`video/mp4`, `video/webm`, `video/ogg`) with automatic canvas thumbnail capture.
- Status labels dynamically reflecting file type (`Saved Image` vs `Saved Video`).
- Direct integration with Media Library modal picker.

### 5. Pagination (`src/components/ui/pagination.tsx`)
- Data range indicator: `Menampilkan X dari Y Data`.
- Segmented previous and next actions with connected pill buttons.
- Numbered page buttons with active state highlighting.

---

## Getting Started

### Prerequisites
- Node.js (v18.17.0 or higher recommended)
- npm, yarn, or pnpm package manager

### Installation

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Run the local development server:
   ```bash
   npm run dev
   ```

3. Open the application in your browser:
   ```
   http://localhost:3000
   ```

### Production Build and Verification

Compile and validate the application for production deployment:

```bash
# Run linting checks
npm run lint

# Build production bundle using Turbopack
npm run build

# Start production server
npm run start
```
