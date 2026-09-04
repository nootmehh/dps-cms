export interface ServiceKeunggulanItem {
  title: string;
  description: string;
}

export interface ServiceMaterialItem {
  category: string;
  name: string;
}

export interface ServiceFAQItem {
  question: string;
  answer: string;
}

export interface ServicePayload {
  id?: string | number;
  title: string;
  category: string;
  categoryVariant?: string;
  imageUrl?: string | null;
  description?: string;
  keunggulan: ServiceKeunggulanItem[];
  materialPeralatan: ServiceMaterialItem[];
  faq: ServiceFAQItem[];
  createdAt?: string;
}

const STORAGE_KEY = "dps_services_data";

export const DEFAULT_SERVICE_CATEGORIES = [
  "Marka Jalan",
  "Perlengkapan Jalan",
  "Elektrikal Jalan",
  "Perlengkapan Parkir",
];

export const SERVICE_CATEGORY_VARIANT_MAP: Record<string, string> = {
  "Marka Jalan": "green",
  "Perlengkapan Jalan": "blue",
  "Elektrikal Jalan": "yellow",
  "Perlengkapan Parkir": "purple",
};

export const INITIAL_SERVICES_DATA: ServicePayload[] = [
  {
    id: "1",
    title: "Pengecatan Marka Jalan",
    category: "Marka Jalan",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Layanan profesional pengecatan marka jalan menggunakan material berkualitas standar nasional dan sertifikasi resmi TKDN. Didukung mesin marka modern dan aplikator berpengalaman untuk hasil yang presisi dan tahan lama.",
    keunggulan: [
      {
        title: "Material Bersertifikat TKDN",
        description:
          "Menggunakan cat coldplastic bersertifikat Tingkat Komponen Dalam Negeri (TKDN) dari Kementerian Perindustrian, mendukung program P3DN dan sesuai untuk proyek pemerintah/BUMN.",
      },
      {
        title: "Aplikator Berpengalaman",
        description:
          "Tim aplikator berpengalaman didukung mesin marka jalan (line marking machine) sehingga hasil garis presisi, tebal merata, dan cepat kering.",
      },
      {
        title: "Manajemen Lalu Lintas Sementara",
        description:
          "Pengerjaan didukung manajemen lalu lintas sementara yang rapi agar proses pengecatan tidak mengganggu aktivitas jalan.",
      },
    ],
    materialPeralatan: [
      {
        category: "Material Marka Jalan – Cat Marka Jalan (Solvent Based)",
        name: "Cat Coldplastic Merk DPS",
      },
      {
        category: "Material Marka Jalan – Bahan Campuran Cat",
        name: "Glass Beads",
      },
      {
        category: "Perlengkapan Pengaturan Lalu Lintas Sementara",
        name: "Traffic Cone",
      },
      {
        category: "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel",
        name: "Stick Cone",
      },
      {
        category: "Perlengkapan Pembatas Jalan/Pengaman Area Kerja",
        name: "Water Barrier",
      },
    ],
    faq: [
      {
        question: "Berapa lama cat marka jalan kering setelah diaplikasikan?",
        answer:
          "Tergantung jenis cat yang digunakan; cat coldplastic umumnya kering dan dapat dilintasi kendaraan dalam waktu relatif singkat, sementara cat solvent based konvensional membutuhkan waktu pengeringan yang lebih lama.",
      },
      {
        question: "Apakah pengecatan marka jalan bisa dilakukan pada malam hari?",
        answer:
          "Bisa. Pengecatan malam hari justru sering dipilih untuk ruas jalan dengan volume lalu lintas tinggi pada siang hari agar pekerjaan tidak mengganggu aktivitas pengguna jalan.",
      },
      {
        question: "Berapa lama umur pakai marka jalan setelah dicat?",
        answer:
          "Umur pakai bergantung pada jenis cat, volume lalu lintas, dan kondisi cuaca, namun cat berkualitas seperti coldplastic umumnya bertahan lebih lama dibandingkan cat marka konvensional.",
      },
    ],
    createdAt: "24 Agu 2024, 10:15",
  },
  {
    id: "2",
    title: "Penghapusan Marka Jalan",
    category: "Marka Jalan",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
    description:
      "Jasa penghapusan garis marka jalan lama secara bersih dan presisi tanpa merusak struktur aspal maupun beton, siap untuk pelapisan marka jalan baru.",
    keunggulan: [
      {
        title: "Metode Sesuai Jenis Permukaan",
        description:
          "Metode penghapusan disesuaikan dengan jenis dan ketebalan material marka sehingga risiko kerusakan pada aspal atau beton dapat diminimalkan.",
      },
      {
        title: "Hasil Rapi & Siap Dilapisi Ulang",
        description:
          "Permukaan hasil penghapusan bersih dan rapi, sehingga siap langsung dilapisi marka jalan baru tanpa tumpang tindih.",
      },
      {
        title: "Pengamanan Area Kerja",
        description:
          "Proses pengerjaan didukung perlengkapan lalu lintas sementara agar area kerja aman dan tidak mengganggu arus lalu lintas.",
      },
    ],
    materialPeralatan: [
      {
        category: "Perlengkapan Pengaturan Lalu Lintas Sementara",
        name: "Traffic Cone",
      },
      {
        category: "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel",
        name: "Stick Cone",
      },
      {
        category: "Perlengkapan Pembatas Jalan/Pengaman Area Kerja",
        name: "Water Barrier",
      },
    ],
    faq: [
      {
        question: "Apakah proses penghapusan marka jalan bisa merusak aspal?",
        answer:
          "Risiko kerusakan diminimalkan dengan memilih metode dan pengaturan alat yang sesuai dengan jenis dan ketebalan permukaan jalan, sehingga struktur aspal atau beton tetap terjaga.",
      },
      {
        question: "Berapa lama waktu pengerjaan penghapusan marka jalan?",
        answer:
          "Durasi bergantung pada panjang dan lebar area marka yang dihapus, jenis material marka lama, serta kondisi lalu lintas di lokasi pengerjaan.",
      },
      {
        question: "Apakah setelah dihapus bisa langsung dicat marka baru?",
        answer:
          "Bisa, permukaan yang sudah dihapus dan dibersihkan umumnya sudah siap untuk proses pengecatan marka jalan baru tanpa perlu perlakuan tambahan.",
      },
    ],
    createdAt: "20 Agu 2024, 14:30",
  },
  {
    id: "3",
    title: "Pemasangan Deliniator",
    category: "Perlengkapan Jalan",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Layanan pemasangan deliniator besi dan plastik bersistem angkur kuat untuk memberikan panduan batas visual tepi jalan dan tikungan rawan kecelakaan.",
    keunggulan: [
      {
        title: "Survei & Perhitungan Titik Sesuai Standar",
        description:
          "Penentuan titik dan jarak pemasangan mengikuti standar keselamatan jalan agar fungsi panduan visual bekerja optimal.",
      },
      {
        title: "Pilihan Material Fleksibel",
        description:
          "Tersedia deliniator besi yang kokoh maupun plastik yang ekonomis, disesuaikan dengan kebutuhan dan anggaran proyek.",
      },
      {
        title: "Pemasangan Kokoh dengan Sistem Angkur",
        description:
          "Proses pemasangan menggunakan sistem angkur sehingga deliniator tidak mudah roboh maupun bergeser di lapangan.",
      },
    ],
    materialPeralatan: [
      {
        category: "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
        name: "Deliniator Besi",
      },
      {
        category: "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
        name: "Deliniator Plastik",
      },
      {
        category: "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi",
        name: "Cermin Tikung",
      },
    ],
    faq: [
      {
        question: "Berapa jarak ideal antar deliniator di jalan?",
        answer:
          "Jarak pemasangan disesuaikan dengan kondisi geometri jalan, seperti tikungan, tanjakan, atau jalan lurus, mengikuti kaidah keselamatan jalan yang berlaku.",
      },
      {
        question: "Lebih baik pilih deliniator besi atau plastik?",
        answer:
          "Deliniator besi lebih kokoh dan cocok untuk lokasi rawan benturan atau lalu lintas berat, sementara deliniator plastik lebih ekonomis dan ringan, cocok untuk jalan lingkungan atau perumahan.",
      },
      {
        question: "Apakah pemasangan deliniator termasuk garansi?",
        answer:
          "Umumnya layanan pemasangan mencakup jaminan kekokohan pemasangan; untuk detail cakupan garansi dapat didiskusikan sesuai kesepakatan proyek.",
      },
    ],
    createdAt: "18 Agu 2024, 09:00",
  },
  {
    id: "4",
    title: "Pemasangan Penerangan Jalan Umum",
    category: "Elektrikal Jalan",
    categoryVariant: "yellow",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    description:
      "Instalasi tiang dan lampu PJU LED konvensional PLN maupun PJU-TS Tenaga Surya oleh tim teknisi kelistrikan bersertifikat.",
    keunggulan: [
      {
        title: "Dua Pilihan Sistem: PLN & Tenaga Surya",
        description:
          "Tersedia sistem konvensional yang terhubung PLN maupun tenaga surya (PJU-TS) yang mandiri energi, termasuk untuk lokasi tanpa akses listrik.",
      },
      {
        title: "Instalasi oleh Teknisi Berpengalaman",
        description:
          "Pekerjaan kelistrikan dikerjakan sesuai standar keselamatan kerja oleh teknisi yang kompeten di bidangnya.",
      },
      {
        title: "Survei & Perhitungan Kebutuhan Cahaya",
        description:
          "Perhitungan titik dan kebutuhan daya disesuaikan dengan lebar dan fungsi jalan agar sistem penerangan bekerja optimal.",
      },
    ],
    materialPeralatan: [
      {
        category: "Perlengkapan Elektrikal Jalan – Pencahayaan",
        name: "Penerangan Jalan Umum (PJU)",
      },
    ],
    faq: [
      {
        question: "Berapa lama waktu pemasangan satu titik PJU?",
        answer:
          "Durasi pemasangan bergantung pada jenis tiang, kondisi lokasi, dan apakah menggunakan sistem konvensional atau tenaga surya, namun umumnya dapat diselesaikan dalam hitungan jam per titik.",
      },
      {
        question: "Apa saja perawatan yang dibutuhkan PJU tenaga surya?",
        answer:
          "PJU tenaga surya membutuhkan pembersihan panel surya secara berkala dan pengecekan kondisi baterai agar kinerja pengisian daya dan pencahayaan tetap optimal.",
      },
      {
        question: "Bisakah PJU dipasang di lokasi tanpa akses listrik PLN?",
        answer:
          "Bisa, untuk lokasi tanpa akses jaringan PLN dapat menggunakan sistem PJU tenaga surya (PJU-TS) yang tidak memerlukan sambungan listrik dari PLN.",
      },
    ],
    createdAt: "15 Agu 2024, 16:45",
  },
  {
    id: "5",
    title: "Pemasangan Paku Marka Jalan",
    category: "Marka Jalan",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Pemasangan paku marka jalan (road stud) reflektor kaca/alumunium dan tenaga surya (solar cell) dengan perekat epoksi berkekuatan tinggi.",
    keunggulan: [
      {
        title: "Pemasangan Presisi Sesuai Standar",
        description:
          "Titik dan jarak pemasangan ditentukan sesuai standar sehingga fungsi panduan visual marka jalan tetap optimal.",
      },
      {
        title: "Tersedia Tipe Solar Cell",
        description:
          "Pilihan paku marka solar cell cocok digunakan untuk area dengan penerangan jalan yang minim.",
      },
      {
        title: "Metode Pemasangan Kuat & Tahan Lama",
        description:
          "Menggunakan lem epoxy atau sistem baut tanam sehingga paku marka melekat kuat dan tahan terhadap beban kendaraan yang melintas berulang kali.",
      },
    ],
    materialPeralatan: [
      {
        category: "Material Marka Jalan – Reflektor Jalan",
        name: "Paku Marka Jalan (Road Stud)",
      },
    ],
    faq: [
      {
        question: "Berapa jarak antar paku marka jalan yang ideal?",
        answer:
          "Jarak pemasangan disesuaikan dengan kebutuhan visibilitas jalan, kondisi tikungan, dan volume lalu lintas di lokasi terkait.",
      },
      {
        question: "Lebih baik pilih paku marka solar atau non-solar?",
        answer:
          "Paku marka solar cocok untuk jalan yang minim penerangan karena memberikan cahaya tambahan pada malam hari, sedangkan non-solar lebih ekonomis dan cukup mengandalkan pantulan cahaya kendaraan.",
      },
      {
        question: "Berapa lama daya tahan pemasangan paku marka jalan?",
        answer:
          "Daya tahan bergantung pada kualitas lem/baut yang digunakan serta volume dan beban kendaraan yang melintas, namun pemasangan yang tepat dapat bertahan dalam jangka waktu yang cukup lama.",
      },
    ],
    createdAt: "12 Agu 2024, 11:30",
  },
  {
    id: "6",
    title: "Pemasangan Rambu Lalu Lintas",
    category: "Perlengkapan Jalan",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Instalasi dan fabrikasi rambu peringatan, larangan, petunjuk, dan rambu kustom untuk kawasan publik, tol, perumahan, serta kawasan komersial.",
    keunggulan: [
      {
        title: "Desain Custom Sesuai Kebutuhan",
        description:
          "Tersedia layanan desain rambu custom untuk kebutuhan spesifik kawasan seperti perumahan, pabrik, maupun pusat perbelanjaan.",
      },
      {
        title: "Material Reflektif Berkualitas",
        description:
          "Rambu tetap terbaca jelas baik siang maupun malam hari berkat material reflektif berkualitas sesuai standar Permenhub.",
      },
      {
        title: "Sesuai Kajian & Regulasi Lalu Lintas",
        description:
          "Proses pemasangan mengikuti kajian manajemen dan rekayasa lalu lintas yang berlaku agar rambu sah dan efektif digunakan.",
      },
    ],
    materialPeralatan: [
      {
        category: "Perlengkapan Jalan – Signage/Papan Informasi",
        name: "Rambu Lalu Lintas",
      },
    ],
    faq: [
      {
        question: "Apakah bisa custom desain rambu untuk kawasan perumahan?",
        answer:
          "Bisa, rambu untuk kawasan swasta seperti perumahan atau pergudangan dapat dibuat dengan desain custom sesuai kebutuhan dan identitas kawasan.",
      },
      {
        question: "Berapa lama proses produksi hingga pemasangan rambu?",
        answer:
          "Durasi bergantung pada jumlah dan jenis rambu yang dipesan, kompleksitas desain, serta kondisi lokasi pemasangan.",
      },
      {
        question: "Apakah pemasangan rambu lalu lintas ini termasuk garansi?",
        answer:
          "Cakupan garansi material dan pemasangan dapat didiskusikan sesuai kesepakatan proyek dengan tim kami.",
      },
    ],
    createdAt: "10 Agu 2024, 15:00",
  },
  {
    id: "7",
    title: "Pemasangan Wheel Stopper",
    category: "Perlengkapan Parkir",
    categoryVariant: "purple",
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80",
    description:
      "Instalasi pengganjal roda / wheel stopper karet maupun beton untuk penataan slot parkir rapi, aman, dan melindungi dinding pembatas.",
    keunggulan: [
      {
        title: "Pilihan Material Sesuai Kebutuhan",
        description:
          "Tersedia material karet yang fleksibel maupun beton yang lebih kokoh, disesuaikan dengan kebutuhan beban kendaraan dan kondisi area parkir.",
      },
      {
        title: "Pemasangan Cepat & Stabil",
        description:
          "Sistem dynabolt membuat wheel stopper terpasang kokoh dan tidak mudah bergeser meski sering tertabrak kendaraan.",
      },
      {
        title: "Menjaga Ketertiban Area Parkir",
        description:
          "Membantu menjaga ketertiban area parkir dan mengurangi risiko benturan kendaraan dengan struktur bangunan.",
      },
    ],
    materialPeralatan: [
      {
        category: "Perlengkapan Parkir",
        name: "Wheel Stopper (karet/beton) — tersedia sebagai item tambahan sesuai permintaan proyek",
      },
    ],
    faq: [
      {
        question: "Wheel stopper karet atau beton, mana yang lebih baik?",
        answer:
          "Wheel stopper karet lebih fleksibel dan cocok untuk kendaraan ringan seperti mobil pribadi, sementara wheel stopper beton lebih kokoh dan cocok untuk area dengan kendaraan lebih berat atau frekuensi penggunaan tinggi.",
      },
      {
        question: "Apakah pemasangan wheel stopper merusak permukaan lantai parkir?",
        answer:
          "Pemasangan menggunakan dynabolt hanya memerlukan titik pengeboran kecil untuk baut, sehingga dampaknya terhadap permukaan lantai relatif minim.",
      },
      {
        question: "Apakah wheel stopper bisa dipesan dengan warna atau reflektor khusus?",
        answer:
          "Bisa, wheel stopper dapat disesuaikan dengan warna atau tambahan elemen reflektif untuk meningkatkan visibilitas di area parkir yang minim pencahayaan.",
      },
    ],
    createdAt: "08 Agu 2024, 09:30",
  },
];

function normalizeServiceItem(item: any): ServicePayload {
  let normalizedMaterial: ServiceMaterialItem[] = [];
  if (Array.isArray(item.materialPeralatan)) {
    normalizedMaterial = item.materialPeralatan.map((m: any) => {
      if (typeof m === "string") {
        const parts = m.split(":");
        if (parts.length > 1) {
          return {
            category: parts[0].trim(),
            name: parts.slice(1).join(":").trim(),
          };
        }
        return {
          category: "Material & Peralatan",
          name: m.trim(),
        };
      }
      return {
        category: m.category || "Material & Peralatan",
        name: m.name || "",
      };
    });
  }

  return {
    ...item,
    materialPeralatan: normalizedMaterial,
  };
}

export function getStoredServices(): ServicePayload[] {
  if (typeof window === "undefined") return INITIAL_SERVICES_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SERVICES_DATA));
      return INITIAL_SERVICES_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map(normalizeServiceItem);
    }
    return INITIAL_SERVICES_DATA;
  } catch {
    return INITIAL_SERVICES_DATA;
  }
}

export function saveStoredServices(services: ServicePayload[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(services));
    } catch (e) {
      console.error("Failed to save services to localStorage", e);
    }
  }
}

export async function getConsistingServiceCategories(): Promise<string[]> {
  const services = getStoredServices();
  const cats = new Set<string>();
  services.forEach((s) => {
    if (s.category) cats.add(s.category);
  });
  return Array.from(cats);
}

export async function getServiceById(id: string | number): Promise<ServicePayload | null> {
  const services = getStoredServices();
  const found = services.find((s) => String(s.id) === String(id));
  return found || null;
}

export async function addService(
  data: Omit<ServicePayload, "id" | "createdAt">,
  imageFile?: File | null
): Promise<ServicePayload> {
  const services = getStoredServices();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }

  const newService: ServicePayload = {
    ...data,
    id: String(Date.now()),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    createdAt: formattedDate,
    categoryVariant: data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[data.category] || "green",
  };

  const updated = [newService, ...services];
  saveStoredServices(updated);
  return newService;
}

export async function editService(
  id: string | number,
  data: Partial<ServicePayload>,
  imageFile?: File | null,
  imageRemoved?: boolean
): Promise<ServicePayload> {
  const services = getStoredServices();
  let updatedService: ServicePayload | null = null;

  const updated = services.map((service) => {
    if (String(service.id) === String(id)) {
      let finalImageUrl = service.imageUrl;
      if (imageRemoved) {
        finalImageUrl = null;
      }
      if (imageFile) {
        finalImageUrl = URL.createObjectURL(imageFile);
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      const nextCategory = data.category !== undefined ? data.category : service.category;

      updatedService = {
        ...service,
        ...data,
        imageUrl: finalImageUrl,
        categoryVariant:
          data.categoryVariant || SERVICE_CATEGORY_VARIANT_MAP[nextCategory] || service.categoryVariant || "green",
      };
      return updatedService;
    }
    return service;
  });

  if (!updatedService) {
    throw new Error(`Service with id ${id} not found.`);
  }

  saveStoredServices(updated);
  return updatedService;
}

export async function deleteService(id: string | number): Promise<void> {
  const services = getStoredServices();
  const nextServices = services.filter((s) => String(s.id) !== String(id));
  saveStoredServices(nextServices);
}
