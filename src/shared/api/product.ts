export interface ProductDetailItem {
  title: string;
  value: string;
}

export interface ProductFeatureItem {
  title: string;
  value: string;
}

export interface ProductPayload {
  id?: string | number;
  title: string;
  category: string;
  categoryVariant?: string;
  imageUrl?: string | null;
  description: string;
  detailProduct: ProductDetailItem[];
  suitableFor: string[];
  kelebihan: ProductFeatureItem[];
  kekurangan: ProductFeatureItem[];
  createdAt?: string;
}

const STORAGE_KEY = "dps_products_data";

export const DEFAULT_PRODUCT_CATEGORIES = [
  "Material Marka Jalan – Bahan Campuran Cat",
  "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
  "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi",
  "Perlengkapan Pengaturan Lalu Lintas Sementara",
  "Material Marka Jalan – Reflektor Jalan",
  "Perlengkapan Pengendali Kecepatan Kendaraan",
  "Perlengkapan Jalan – Signage/Papan Informasi",
  "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel",
  "Perlengkapan Pembatas Jalan/Pengaman Area Kerja",
  "Perlengkapan Pengaman Jalan – Pagar Pengaman",
  "Material Marka Jalan – Cat Marka Jalan (Solvent Based)",
  "Perlengkapan Elektrikal Jalan – Pencahayaan",
  "Material Perawatan & Perbaikan Jalan",
  "Perlengkapan Area Parkir",
];

export const CATEGORY_VARIANT_MAP: Record<string, string> = {
  "Material Marka Jalan – Bahan Campuran Cat": "green",
  "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah": "blue",
  "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi": "yellow",
  "Perlengkapan Pengaturan Lalu Lintas Sementara": "orange",
  "Material Marka Jalan – Reflektor Jalan": "green",
  "Perlengkapan Pengendali Kecepatan Kendaraan": "purple",
  "Perlengkapan Jalan – Signage/Papan Informasi": "blue",
  "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel": "orange",
  "Perlengkapan Pembatas Jalan/Pengaman Area Kerja": "red",
  "Perlengkapan Pengaman Jalan – Pagar Pengaman": "purple",
  "Material Marka Jalan – Cat Marka Jalan (Solvent Based)": "green",
  "Perlengkapan Elektrikal Jalan – Pencahayaan": "yellow",
  "Material Perawatan & Perbaikan Jalan": "blue",
  "Perlengkapan Area Parkir": "purple",
};

export const INITIAL_PRODUCTS_DATA: ProductPayload[] = [
  {
    id: "1",
    title: "Glass Beads (Butiran Kaca Reflektif Marka Jalan)",
    category: "Material Marka Jalan – Bahan Campuran Cat",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
    description:
      "Glass beads adalah butiran kaca berkualitas tinggi yang ditaburkan di atas permukaan cat marka jalan saat masih basah, atau dicampur langsung ke dalam formula cat (premix), untuk menghasilkan efek retroreflektif atau memantulkan cahaya lampu kendaraan pada malam hari. Produk ini menjadi komponen wajib dalam setiap pekerjaan pengecatan marka jalan modern karena secara langsung menentukan tingkat keterbacaan garis marka, zebra cross, dan simbol jalan pada kondisi minim cahaya maupun hujan. Kualitas glass beads yang baik, dengan kebulatan sempurna dan bebas gelembung udara, akan memaksimalkan pemantulan cahaya kembali ke arah sumbernya sehingga pengendara dapat mengenali batas jalur jauh sebelum mendekat. Sebagai produk perlengkapan jalan, glass beads banyak dicari oleh kontraktor marka jalan, dinas perhubungan, dan pengelola kawasan industri maupun perumahan yang membutuhkan marka jalan tahan lama dan reflektif optimal.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp20.000 – Rp35.000/kg" },
      { title: "Kemasan", value: "25 kg/karung" },
      { title: "Pemakaian", value: "Sekitar 150–250 gram/m² (metode tabur/drop-on)" },
      { title: "Aplikasi", value: "Ditaburkan manual atau dengan mesin bead dispenser di atas cat marka yang masih basah" },
      {
        title: "Spesifikasi",
        value:
          "Tipe drop-on maupun premix, standar AASHTO M247 Type I/III, ukuran butiran 100–800 mikron, indeks bias minimal 1,50, kebulatan (roundness) di atas 80%",
      },
    ],
    suitableFor: [
      "Proyek Pengecatan Marka Jalan: Digunakan bersamaan dengan jasa pengecatan marka jalan, baik menggunakan cat thermoplastic, cold plastic, maupun solvent based, sebagai komponen pelengkap yang tidak terpisahkan dari proses aplikasi marka jalan.",
      "Marka Jalan Standar Bina Marga: Cocok untuk proyek yang membutuhkan hasil akhir marka jalan dengan daya reflektif sesuai standar Bina Marga.",
    ],
    kelebihan: [
      {
        title: "Meningkatkan Visibilitas & Keselamatan",
        value:
          "Meningkatkan visibilitas dan keselamatan berkendara pada malam hari serta kondisi hujan, dengan usia pakai fungsi reflektif yang lebih panjang bila diaplikasikan dengan takaran yang tepat.",
      },
      {
        title: "Kompatibel & Ekonomis",
        value:
          "Harga relatif terjangkau dibandingkan sistem reflektor lain, serta kompatibel dengan berbagai jenis cat marka jalan (thermoplastic, cold plastic, solvent based).",
      },
    ],
    kekurangan: [
      {
        title: "Daya Reflektif Menurun Seiring Waktu",
        value:
          "Daya reflektif menurun akibat gesekan roda kendaraan dan kotoran jalan, serta hasil kurang maksimal apabila kualitas kebulatan butiran kaca rendah.",
      },
      {
        title: "Sensitif terhadap Cuaca & Ketepatan Aplikasi",
        value:
          "Membutuhkan aplikator berpengalaman agar takaran dan waktu tabur presisi, serta sensitif terhadap kelembapan saat proses aplikasi.",
      },
    ],
    createdAt: "26 Agu 2024, 09:30",
  },
  {
    id: "2",
    title: "Deliniator Besi",
    category: "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Deliniator besi adalah rambu tiang pengarah yang dipasang berjajar di sepanjang tepi jalan, tikungan, median, maupun area rawan kecelakaan untuk memberikan panduan visual arah dan batas badan jalan kepada pengemudi, terutama pada malam hari melalui reflektor yang terpasang. Dibuat dari material besi yang kokoh, deliniator jenis ini umumnya dipilih untuk lokasi dengan intensitas lalu lintas tinggi, jalan nasional, jalan tol, maupun kawasan industri yang membutuhkan daya tahan ekstra terhadap benturan ringan dan cuaca ekstrem. Konstruksi besi galvanis membuat produk ini lebih tahan terhadap korosi dibandingkan bahan logam biasa, sehingga cocok dipakai untuk pemasangan jangka panjang tanpa perawatan intensif. Deliniator besi juga sering menjadi bagian dari paket pekerjaan perlengkapan jalan yang dikerjakan bersamaan dengan pemasangan rambu dan marka jalan pada proyek infrastruktur pemerintah maupun swasta.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp150.000 – Rp250.000/batang" },
      { title: "Kemasan/Satuan", value: "Per batang, lengkap dengan angkur" },
      { title: "Aplikasi/Pemasangan", value: "Ditanam pada permukaan jalan/bahu jalan menggunakan angkur besi" },
      { title: "Spesifikasi", value: "Material steel pipa 3–4 inchi, tinggi 75–120 cm, reflektor kaca mata kucing dua sisi, finishing cat anti karat" },
    ],
    suitableFor: [
      "Jalan Nasional & Volume Lalu Lintas Tinggi: Cocok dipasang pada ruas jalan dengan volume kendaraan berat/tinggi serta proyek jalan nasional yang membutuhkan struktur kokoh dan tahan lama.",
      "Tikungan Tajam & Area Rawan: Ideal untuk tikungan tajam, tanjakan, dan turunan yang memerlukan panduan arah yang jelas bagi pengemudi.",
    ],
    kelebihan: [
      {
        title: "Konstruksi Kokoh & Tahan Lama",
        value: "Konstruksi kokoh tahan terhadap benturan ringan maupun cuaca ekstrem, dengan umur pakai lebih panjang dibandingkan deliniator berbahan plastik.",
      },
      {
        title: "Reflektor Tajam & Tampilan Formal",
        value: "Reflektor kaca mata kucing memberikan pantulan cahaya yang lebih tajam, dengan tampilan yang lebih formal dan sesuai untuk jalan nasional/jalan tol.",
      },
    ],
    kekurangan: [
      {
        title: "Biaya & Bobot Lebih Tinggi",
        value: "Bobot lebih berat sehingga proses distribusi dan pemasangan membutuhkan tenaga lebih besar, dengan biaya material dan pemasangan yang lebih tinggi dibandingkan deliniator plastik.",
      },
      {
        title: "Risiko Korosi & Benturan",
        value: "Rawan korosi apabila lapisan galvanis atau cat anti karat tidak sempurna, dan berisiko lebih membahayakan kendaraan apabila tertabrak dibandingkan bahan plastik yang lentur.",
      },
    ],
    createdAt: "22 Agu 2024, 15:10",
  },
  {
    id: "3",
    title: "Cermin Tikung (Convex Mirror)",
    category: "Perlengkapan Keselamatan Jalan – Alat Bantu Pandang Pengemudi",
    categoryVariant: "yellow",
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80",
    description:
      "Cermin tikung atau convex mirror adalah perlengkapan jalan berbentuk cermin cembung yang dipasang pada tikungan tajam, persimpangan dengan sudut pandang terbatas (blind spot), pertigaan sempit, maupun jalan menuju area parkir dan pintu keluar-masuk kawasan. Bentuk cembungnya memungkinkan cermin ini menangkap sudut pandang yang jauh lebih luas dibandingkan cermin datar biasa, sehingga pengemudi dapat melihat kendaraan atau pejalan kaki yang datang dari arah berlawanan sebelum benar-benar terlihat langsung. Produk ini menjadi salah satu solusi paling efektif dan ekonomis untuk mengurangi risiko kecelakaan di titik-titik rawan tabrakan akibat keterbatasan sudut pandang, terutama di kawasan permukiman, area pergudangan, sekolah, dan jalan lingkungan dengan geometri jalan yang tidak ideal. Pemasangannya biasanya menjadi satu paket pekerjaan dengan perlengkapan keselamatan jalan lainnya seperti deliniator dan rambu peringatan.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp350.000 – Rp1.500.000/unit (tergantung diameter 45–100 cm)" },
      { title: "Kemasan/Satuan", value: "Per unit, lengkap bracket dan tiang penyangga" },
      { title: "Aplikasi/Pemasangan", value: "Dipasang pada tiang di sisi tikungan/persimpangan, sudut pandang disesuaikan langsung di lapangan" },
      { title: "Spesifikasi", value: "Diameter 60–100 cm, bahan akrilik/kaca dengan lapisan anti pecah dan anti UV, tiang penyangga besi galvanis" },
    ],
    suitableFor: [
      "Tikungan Tajam & Persimpangan: Dipasang pada titik tikungan tajam dan persimpangan dengan sudut pandang terbatas untuk membantu pengemudi melihat kendaraan dari arah berlawanan.",
      "Area Blind Spot Kawasan: Melengkapi sistem perlengkapan keselamatan jalan di area blind spot seperti kawasan permukiman, pergudangan, dan sekolah.",
    ],
    kelebihan: [
      {
        title: "Memperluas Sudut Pandang Pengemudi",
        value: "Memperluas sudut pandang pengemudi hingga mendekati 160-180 derajat sehingga efektif mengurangi risiko kecelakaan di tikungan dan persimpangan minim visibilitas.",
      },
      {
        title: "Instalasi Mudah & Ekonomis",
        value: "Instalasi relatif mudah dan cepat dengan tiang penyangga standar, dengan biaya investasi yang jauh lebih rendah dibandingkan solusi kamera pemantau.",
      },
    ],
    kekurangan: [
      {
        title: "Rentan Kerusakan & Perlu Perawatan",
        value: "Rentan terhadap pecah atau rusak akibat vandalisme dan lemparan benda keras, serta membutuhkan pembersihan dan perawatan berkala agar pantulan tetap jernih.",
      },
      {
        title: "Keterbatasan Optik pada Kondisi Tertentu",
        value: "Bayangan objek pada jarak jauh dapat terlihat lebih kecil dan terdistorsi, serta kinerja menurun pada kondisi kabut tebal, hujan deras, atau cermin berembun.",
      },
    ],
    createdAt: "19 Agu 2024, 11:45",
  },
  {
    id: "4",
    title: "Traffic Cone",
    category: "Perlengkapan Pengaturan Lalu Lintas Sementara",
    categoryVariant: "orange",
    imageUrl: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=80",
    description:
      "Traffic cone atau kerucut lalu lintas merupakan perlengkapan standar yang digunakan untuk menandai, membatasi, dan mengalihkan arus lalu lintas secara sementara pada area yang sedang dikerjakan, seperti lokasi pengecatan marka jalan, penghapusan marka jalan, perbaikan jalan, atau kegiatan proyek konstruksi di sekitar badan jalan. Warna oranye mencolok yang dipadukan dengan pita reflektif membuat traffic cone mudah dikenali pengendara baik siang maupun malam hari, sehingga membantu mengarahkan kendaraan menjauhi area kerja dan menjaga keselamatan pekerja di lapangan. Produk ini menjadi perlengkapan wajib bagi kontraktor jasa marka jalan dan perlengkapan jalan karena fungsinya sebagai pengaman sementara sebelum, selama, dan setelah proses pekerjaan berlangsung. Selain untuk proyek jalan, traffic cone juga banyak digunakan di area parkir, gudang, dan kawasan komersial untuk pengaturan sirkulasi kendaraan.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp75.000 – Rp350.000/unit (tergantung tinggi 50–100 cm)" },
      { title: "Kemasan/Satuan", value: "Per unit" },
      { title: "Aplikasi/Penggunaan", value: "Ditempatkan langsung di area kerja sebagai pembatas sementara, mudah dipindah sesuai kebutuhan" },
      { title: "Spesifikasi", value: "Bahan PVC/PE lentur, tinggi 50–100 cm, warna oranye dengan pita reflektif putih/perak, dasar stabil anti guling" },
    ],
    suitableFor: [
      "Area Kerja Pengecatan & Penghapusan Marka: Digunakan sebagai pembatas dan pengaman area kerja sementara selama proses pengecatan maupun penghapusan marka jalan berlangsung.",
      "Pengalihan Arus Lalu Lintas: Membantu mengalihkan arus lalu lintas dengan aman di sekitar lokasi proyek maupun area parkir dan gudang.",
    ],
    kelebihan: [
      {
        title: "Ringan & Ekonomis",
        value: "Ringan dan mudah dipindahkan sesuai kebutuhan pengaturan lalu lintas, dengan harga yang ekonomis sehingga dapat disediakan dalam jumlah banyak.",
      },
      {
        title: "Mudah Dikenali & Praktis",
        value: "Warna mencolok dan reflektif membuatnya mudah terlihat dari kejauhan, serta mudah disusun dan dibongkar sehingga efisien untuk pekerjaan jangka pendek.",
      },
    ],
    kekurangan: [
      {
        title: "Rentan Terguling & Cepat Aus",
        value: "Mudah terguling atau terbawa angin kencang maupun terserempet kendaraan, dengan daya tahan material yang terbatas terhadap paparan sinar matahari dalam jangka panjang.",
      },
      {
        title: "Tidak untuk Penggunaan Permanen",
        value: "Kurang cocok digunakan sebagai pengaman lalu lintas yang bersifat permanen, dan berisiko hilang atau rusak apabila digunakan di lokasi dengan pengawasan minim.",
      },
    ],
    createdAt: "16 Agu 2024, 14:00",
  },
  {
    id: "5",
    title: "Paku Marka Jalan (Road Stud)",
    category: "Material Marka Jalan – Reflektor Jalan",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Paku marka jalan atau road stud adalah reflektor jalan berkekuatan tinggi yang dipasang tertanam pada permukaan aspal atau beton untuk memandu arah lajur kendaraan terutama pada kondisi malam hari, cuaca hujan, maupun kabut tebal. Tersedia dalam tipe pasif berbahan alumunium cor/kaca temper serta tipe aktif solar cell bertenaga surya.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp25.000 – Rp150.000/unit (solar & non-solar)" },
      { title: "Kemasan/Satuan", value: "Per unit" },
      { title: "Aplikasi/Pemasangan", value: "Ditanam dan direkatkan dengan lem epoksi khusus pada permukaan jalan" },
      { title: "Spesifikasi", value: "Material cast aluminium alloy / tempered glass, tahan beban hingga 20-30 ton, reflektor prismatik 2 sisi" },
    ],
    suitableFor: [
      "Jalan Tol & Jalur Utama: Memandu pengendara di garis marka lajur dan pembatas jalan pada malam hari.",
      "Zona Rawan & Tikungan: Meningkatkan kewaspadaan di area tikungan rawan dan batas lajur berbahaya.",
    ],
    kelebihan: [
      {
        title: "Daya Pantul Sangat Tinggi",
        value: "Memberikan visibilitas ekstra tinggi di kegelapan dan cuaca buruk serta memberikan efek getar (rumble effect) saat terlindas.",
      },
      {
        title: "Konstruksi Sangat Kuat",
        value: "Mampu menahan beban kendaraan berat dan tidak mudah pecah karena konstruksi aluminium padat.",
      },
    ],
    kekurangan: [
      {
        title: "Pemasangan Butuh Perekat Presisi",
        value: "Memerlukan lem epoksi khusus dan permukaan aspal yang kering agar tidak mudah terlepas.",
      },
    ],
    createdAt: "15 Agu 2024, 16:30",
  },
  {
    id: "6",
    title: "Speed Bumps (Speed Bump / Polisi Tidur)",
    category: "Perlengkapan Pengendali Kecepatan Kendaraan",
    categoryVariant: "purple",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    description:
      "Speed bumps atau yang lebih dikenal dengan sebutan polisi tidur adalah perlengkapan pengendali kecepatan yang dipasang melintang pada badan jalan untuk memaksa pengendara menurunkan kecepatan kendaraannya, biasanya diterapkan di area permukiman, sekolah, rumah sakit, kawasan industri, dan tempat parkir. Produk speed bump modern umumnya berbahan karet atau thermoplastic yang dirancang agar dapat dipasang langsung di atas permukaan aspal atau beton tanpa perlu proses pengecoran, sehingga proses instalasi jauh lebih cepat dibandingkan speed bump konvensional dari bahan beton cor. Warna kuning-hitam dengan pola reflektif yang diaplikasikan pada permukaannya membuat speed bump tetap terlihat jelas pada malam hari, sehingga membantu mencegah kecelakaan akibat pengendara yang tidak menyadari keberadaannya. Sebagai bagian dari perlengkapan keselamatan jalan, speed bump sering dipasang berdampingan dengan rambu peringatan dan marka jalan agar fungsinya optimal.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp200.000 – Rp800.000/meter (tergantung ketebalan dan merek)" },
      { title: "Kemasan/Satuan", value: "Per meter (panjang standar 1 meter/pcs)" },
      { title: "Aplikasi/Pemasangan", value: "Dipasang langsung di atas permukaan aspal/beton menggunakan dynabolt, tanpa pengecoran" },
      { title: "Spesifikasi", value: "Bahan karet daur ulang atau thermoplastic, tinggi 4–10 cm sesuai standar Kemenhub, varian speed bump/hump/table" },
    ],
    suitableFor: [
      "Kawasan Permukiman & Sekolah: Dipasang di area permukiman dan sekolah untuk menurunkan kecepatan kendaraan secara efektif demi keselamatan warga dan siswa.",
      "Kawasan Industri & Area Parkir: Cocok digunakan di kawasan industri dan tempat parkir sebagai satu kesatuan sistem pengendalian kecepatan bersama rambu dan marka jalan.",
    ],
    kelebihan: [
      {
        title: "Efektif Kendalikan Kecepatan",
        value: "Efektif menurunkan kecepatan kendaraan tanpa memerlukan pengawasan langsung, dengan proses pemasangan yang cepat karena tidak memerlukan pengecoran seperti speed bump beton.",
      },
      {
        title: "Fleksibel & Mudah Dirawat",
        value: "Mudah dipindahkan atau dilepas apabila lokasi memerlukan penyesuaian, dengan desain modular yang memudahkan penggantian bagian yang rusak tanpa mengganti seluruh unit.",
      },
    ],
    kekurangan: [
      {
        title: "Menimbulkan Bising & Berisiko bagi Kendaraan",
        value: "Menimbulkan bising dan getaran, terutama bagi kendaraan yang melintas dengan kecepatan tinggi, dan berisiko merusak bagian bawah kendaraan apabila desain atau tinggi tidak sesuai standar.",
      },
      {
        title: "Perlu Rambu Tambahan & Perawatan Daya Rekat",
        value: "Memerlukan rambu peringatan tambahan agar tidak mengejutkan pengendara, serta daya rekat pada permukaan jalan dapat berkurang seiring waktu dan volume lalu lintas tinggi.",
      },
    ],
    createdAt: "12 Agu 2024, 08:20",
  },
  {
    id: "7",
    title: "Rambu Lalu Lintas",
    category: "Perlengkapan Jalan – Signage/Papan Informasi",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Rambu lalu lintas adalah papan informasi berupa simbol, tulisan, maupun kombinasi keduanya yang berfungsi memberi peringatan, larangan, perintah, maupun petunjuk kepada pengguna jalan agar berlalu lintas dengan aman dan tertib. Setiap rambu diproduksi mengikuti standar teknis pemerintah, mulai dari ukuran, warna, jenis huruf, hingga tingkat reflektivitas material yang digunakan, sehingga tetap terbaca jelas baik pada siang hari maupun saat disinari lampu kendaraan di malam hari. Sebagai bagian penting dari perlengkapan jalan, rambu lalu lintas dibutuhkan di hampir seluruh ruas jalan, mulai dari jalan lingkungan, jalan kabupaten/kota, jalan provinsi, hingga jalan nasional dan tol, untuk mendukung manajemen dan rekayasa lalu lintas yang tertib. Pemasangan rambu yang tepat lokasi dan sesuai regulasi turut berperan besar dalam menekan angka pelanggaran dan kecelakaan lalu lintas.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp500.000 – Rp2.500.000/unit (lengkap tiang, tergantung ukuran & grade reflektif)" },
      { title: "Kemasan/Satuan", value: "Per unit, lengkap daun rambu dan tiang" },
      { title: "Aplikasi/Pemasangan", value: "Ditanam pada pondasi/angkur di titik lokasi sesuai kajian manajemen dan rekayasa lalu lintas" },
      { title: "Spesifikasi", value: "Pelat alumunium/besi galvanis, stiker reflektif scotchlite grade engineer, high intensity, atau diamond grade sesuai Permenhub" },
    ],
    suitableFor: [
      "Proyek Pemerintah: Digunakan untuk kebutuhan proyek dinas perhubungan dan dinas PU yang memerlukan rambu sesuai standar teknis nasional.",
      "Kawasan Swasta: Cocok untuk kawasan swasta seperti perumahan, pabrik, dan pusat perbelanjaan yang membutuhkan sistem informasi dan pengaturan lalu lintas mandiri.",
    ],
    kelebihan: [
      {
        title: "Sesuai Standar & Terbaca Jelas",
        value: "Sesuai standar nasional sehingga sah secara hukum digunakan di jalan umum, dengan informasi yang tetap jelas terbaca baik siang maupun malam hari berkat material reflektif.",
      },
      {
        title: "Tahan Lama & Beragam Jenis",
        value: "Material alumunium/besi galvanis tahan lama terhadap cuaca ekstrem, tersedia berbagai jenis sesuai kebutuhan: peringatan, larangan, perintah, dan petunjuk.",
      },
    ],
    kekurangan: [
      {
        title: "Rawan Vandalisme & Reflektivitas Menurun",
        value: "Rawan menjadi sasaran vandalisme, pencurian, maupun coretan grafiti, dan tingkat reflektivitas stiker menurun seiring waktu sehingga perlu peremajaan berkala.",
      },
      {
        title: "Biaya Grade Tinggi & Perlu Lokasi Tepat",
        value: "Biaya material reflektif grade tinggi (diamond grade) relatif mahal, serta membutuhkan lokasi dan tinggi pemasangan yang tepat agar tidak terhalang pohon/bangunan.",
      },
    ],
    createdAt: "10 Agu 2024, 11:00",
  },
  {
    id: "8",
    title: "Stick Cone (Flexible Delineator/Traffic Stick Cone)",
    category: "Perlengkapan Pengaturan Lalu Lintas Sementara/Fleksibel",
    categoryVariant: "orange",
    imageUrl: "https://images.unsplash.com/photo-1578885136359-16c8bd4d3a8e?w=800&auto=format&fit=crop&q=80",
    description:
      "Stick cone atau flexible delineator adalah perlengkapan pengaturan lalu lintas berbentuk tiang lentur yang dirancang khusus agar dapat menekuk saat tertabrak atau terlindas kendaraan, kemudian kembali tegak ke posisi semula tanpa mengalami kerusakan berarti. Karakteristik fleksibel inilah yang membedakannya dari traffic cone biasa, sehingga stick cone lebih tahan lama digunakan pada area kerja dengan intensitas lalu lintas padat, seperti pembatas jalur kerja saat pengecatan atau penghapusan marka jalan yang membutuhkan pembatas garis kerja dalam durasi lebih panjang. Warna oranye cerah dengan pita reflektif membuat stick cone tetap terlihat jelas dari kejauhan, baik siang maupun malam hari, sehingga efektif mengarahkan kendaraan menjauhi zona kerja pekerja di lapangan. Produk ini semakin populer digunakan oleh kontraktor jasa marka jalan karena kombinasi antara daya tahan dan keamanan yang lebih baik dibandingkan traffic cone konvensional.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp150.000 – Rp350.000/unit" },
      { title: "Kemasan/Satuan", value: "Per unit" },
      { title: "Aplikasi/Penggunaan", value: "Ditempel/dibaut pada permukaan jalan menggunakan lem atau dynabolt di area kerja/pembatas jalur" },
      { title: "Spesifikasi", value: "Bahan PU/PVC fleksibel, tinggi 70–100 cm, dasar karet anti slip, reflektif, kembali ke posisi semula setelah tertabrak" },
    ],
    suitableFor: [
      "Ruas Jalan Padat: Digunakan pada ruas jalan dengan volume lalu lintas padat yang berisiko tinggi terhadap benturan berulang selama pekerjaan berlangsung.",
      "Pekerjaan Marka Jalan Durasi Panjang: Ideal untuk pekerjaan pengecatan dan penghapusan marka jalan berdurasi panjang karena tidak perlu sering diganti.",
    ],
    kelebihan: [
      {
        title: "Fleksibel & Tahan Lama",
        value: "Fleksibel dan mampu kembali ke posisi semula setelah tertabrak atau terlindas, sehingga lebih tahan lama dibandingkan traffic cone konvensional pada area lalu lintas padat.",
      },
      {
        title: "Aman & Stabil di Lapangan",
        value: "Tidak berpotensi merusak kendaraan yang tidak sengaja menyerempetnya, dengan dasar karet anti slip yang membuat posisinya lebih stabil di badan jalan.",
      },
    ],
    kekurangan: [
      {
        title: "Harga Lebih Mahal",
        value: "Harga per unit relatif lebih mahal dibandingkan traffic cone standar, dan bagian dasar (base) lebih cepat aus apabila sering terlindas kendaraan berat.",
      },
      {
        title: "Perlu Permukaan Rata & Rentan Pudar",
        value: "Membutuhkan permukaan jalan yang rata untuk pemasangan dengan lem atau dynabolt, serta warna dapat memudar lebih cepat pada paparan sinar matahari intensitas tinggi.",
      },
    ],
    createdAt: "08 Agu 2024, 14:15",
  },
  {
    id: "9",
    title: "Deliniator Plastik",
    category: "Perlengkapan Keselamatan Jalan – Rambu Petunjuk Arah",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Deliniator plastik adalah versi ringan dari deliniator besi yang berfungsi sama, yaitu memberikan panduan arah dan batas badan jalan bagi pengemudi, terutama pada tikungan, median jalan, dan area rawan kecelakaan. Terbuat dari bahan plastik HDPE atau PP berkualitas dengan tambahan aditif anti UV, deliniator plastik dirancang agar tidak mudah getas meski terpapar sinar matahari dalam jangka waktu lama, sekaligus tetap ringan sehingga proses distribusi dan pemasangan menjadi lebih efisien. Produk ini menjadi pilihan populer untuk proyek dengan anggaran terbatas atau kebutuhan pemasangan dalam jumlah besar, seperti jalan lingkungan, jalan kabupaten, dan kawasan perumahan, karena harganya yang lebih ekonomis dibandingkan deliniator besi namun tetap memenuhi fungsi keselamatan dasar. Sifatnya yang lentur juga membuat deliniator plastik relatif lebih aman bagi kendaraan apabila tidak sengaja tertabrak dibandingkan deliniator berbahan logam.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp90.000 – Rp180.000/batang" },
      { title: "Kemasan/Satuan", value: "Per batang" },
      { title: "Aplikasi/Pemasangan", value: "Ditanam pada permukaan jalan/bahu jalan menggunakan sistem angkur atau baut tanam" },
      { title: "Spesifikasi", value: "Bahan HDPE/PP tahan UV, tinggi 75–100 cm, reflektor dua sisi" },
    ],
    suitableFor: [
      "Jalan Lingkungan & Jalan Desa: Cocok untuk proyek jalan lingkungan dan jalan desa yang membutuhkan volume pemasangan besar namun tetap efisien dari sisi biaya.",
      "Kawasan Perumahan: Ideal untuk kawasan perumahan tanpa lalu lintas kendaraan berat yang tetap membutuhkan panduan arah dasar.",
    ],
    kelebihan: [
      {
        title: "Ringan & Ekonomis",
        value: "Bobot ringan sehingga mudah didistribusikan dan dipasang dalam jumlah banyak, dengan harga yang lebih ekonomis dibandingkan deliniator besi.",
      },
      {
        title: "Tahan Korosi & Lebih Aman",
        value: "Tahan terhadap korosi karena tidak berbahan dasar logam, dan lebih aman bagi kendaraan yang tidak sengaja tertabrak karena sifatnya yang lentur.",
      },
    ],
    kekurangan: [
      {
        title: "Kurang Kokoh untuk Lalu Lintas Berat",
        value: "Struktur kurang kokoh dibandingkan deliniator besi untuk lokasi dengan lalu lintas berat, dan lebih mudah patah apabila tertabrak keras oleh kendaraan besar.",
      },
      {
        title: "Rentan Getas & Umur Pakai Lebih Pendek",
        value: "Berpotensi getas dan retak apabila kualitas aditif anti UV rendah dan terpapar cuaca ekstrem dalam waktu lama, dengan umur pakai yang umumnya lebih pendek dibandingkan deliniator besi.",
      },
    ],
    createdAt: "05 Agu 2024, 09:00",
  },
  {
    id: "10",
    title: "Water Barrier",
    category: "Perlengkapan Pembatas Jalan/Pengaman Area Kerja",
    categoryVariant: "red",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    description:
      "Water barrier adalah pembatas jalan portabel yang menggunakan air sebagai pemberat untuk memberikan stabilitas, sehingga dapat dipasang dan dibongkar dengan mudah sesuai kebutuhan proyek tanpa memerlukan pondasi permanen. Produk ini umumnya digunakan untuk memisahkan area kerja dari jalur lalu lintas aktif, membatasi akses kendaraan ke zona tertentu, maupun mengarahkan alur lalu lintas pada proyek jalan, event, atau kawasan konstruksi. Sistem interlock atau sambungan antar unit memungkinkan water barrier disusun memanjang membentuk pembatas yang kokoh dan rapi, sementara desainnya yang dapat dikosongkan airnya membuat proses pemindahan menjadi jauh lebih ringan dan praktis dibandingkan barrier beton. Warna oranye atau kombinasi putih-merah dengan permukaan reflektif membuat water barrier tetap terlihat jelas oleh pengendara pada malam hari, menjadikannya perlengkapan penting dalam pekerjaan yang melibatkan pengaturan dan pembatasan lalu lintas sementara.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp700.000 – Rp1.500.000/unit" },
      { title: "Kemasan/Satuan", value: "Per unit (panjang 1–2 meter), diisi air/pasir di lokasi" },
      { title: "Aplikasi/Penggunaan", value: "Disusun memanjang dengan sistem interlock sebagai pembatas jalur atau area kerja" },
      { title: "Spesifikasi", value: "Bahan HDPE, panjang 1–2 m, tinggi 80–100 cm, warna oranye/putih-merah reflektif" },
    ],
    suitableFor: [
      "Proyek Berdurasi Menengah–Panjang: Digunakan sebagai pembatas area kerja pada proyek pengecatan dan penghapusan marka jalan yang berlangsung dalam durasi menengah hingga panjang.",
      "Pembatas Lebih Kokoh: Cocok untuk lokasi yang membutuhkan pembatas lebih kokoh dibandingkan traffic cone maupun stick cone.",
    ],
    kelebihan: [
      {
        title: "Fleksibel & Tanpa Pondasi Permanen",
        value: "Mudah dipindahkan dalam kondisi kosong (tanpa air) sehingga fleksibel untuk berbagai lokasi, dan tidak memerlukan pondasi atau pengecoran permanen.",
      },
      {
        title: "Hemat & Dapat Digunakan Berulang",
        value: "Biaya perawatan rendah dan dapat digunakan berulang kali, serta dapat disusun memanjang membentuk pembatas yang kontinu dan rapi.",
      },
    ],
    kekurangan: [
      {
        title: "Kurang Kokoh untuk Benturan Besar",
        value: "Kekokohan tidak sebanding dengan barrier beton untuk menahan benturan kendaraan besar, dan kurang optimal digunakan pada jalan dengan kecepatan kendaraan tinggi.",
      },
      {
        title: "Butuh Waktu Isi Air & Risiko Bergeser",
        value: "Membutuhkan waktu tambahan untuk mengisi dan mengosongkan air saat pemasangan/pembongkaran, serta berpotensi bergeser apabila air pemberat tidak terisi penuh atau terjadi kebocoran.",
      },
    ],
    createdAt: "03 Agu 2024, 13:40",
  },
  {
    id: "11",
    title: "Guardrail",
    category: "Perlengkapan Pengaman Jalan – Pagar Pengaman",
    categoryVariant: "purple",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Guardrail atau pagar pengaman jalan adalah sistem perlindungan pasif yang dipasang di sisi jalan pada area rawan seperti tikungan tajam, tepi jurang, jembatan, dan median jalan bebas hambatan, dengan tujuan menahan dan mengarahkan kembali kendaraan yang keluar dari jalurnya agar tidak terjun ke area berbahaya di luar badan jalan. Konstruksi guardrail dirancang untuk menyerap energi benturan secara bertahap melalui deformasi pelat baja, sehingga dapat mengurangi tingkat keparahan kecelakaan dibandingkan kendaraan yang langsung menabrak objek keras atau terjun bebas. Sebagai perlengkapan pengaman jalan berskala besar, guardrail umumnya menjadi bagian dari proyek infrastruktur jalan nasional, jalan tol, dan jembatan yang memerlukan standar keselamatan tinggi, dengan proses pemasangan yang melibatkan perhitungan struktur dan penempatan titik kritis sesuai kajian teknis lalu lintas.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp600.000 – Rp1.200.000/meter (material lengkap: beam, tiang, aksesoris)" },
      { title: "Kemasan/Satuan", value: "Per set (umumnya dijual per 4 meter)" },
      { title: "Aplikasi/Pemasangan", value: "Tiang H-post ditanam ke tanah/pondasi, beam disambung antar tiang menggunakan baut" },
      { title: "Spesifikasi", value: "Pelat baja galvanis tipe W-beam/thrie-beam, tiang H-post, spacer block, end terminal, sesuai spesifikasi Bina Marga/PUPR" },
    ],
    suitableFor: [
      "Jalan Tol & Jalan Nasional: Dipasang pada proyek jalan tol dan jalan nasional yang membutuhkan sistem pengamanan tepi jalan yang lebih kompleks.",
      "Jembatan & Tikungan Rawan: Cocok untuk area jembatan dan tikungan tajam yang berisiko tinggi terhadap kendaraan keluar jalur.",
    ],
    kelebihan: [
      {
        title: "Melindungi & Menyerap Energi Benturan",
        value: "Melindungi kendaraan agar tidak keluar jalur ke area berbahaya di luar badan jalan, serta mampu menyerap energi benturan sehingga mengurangi tingkat keparahan kecelakaan.",
      },
      {
        title: "Tahan Lama & Jadi Standar Proyek",
        value: "Material baja galvanis tahan lama terhadap korosi dan cuaca ekstrem, dan menjadi standar wajib pada banyak proyek jalan nasional dan tol.",
      },
    ],
    kekurangan: [
      {
        title: "Biaya & Kebutuhan Tenaga Terlatih Tinggi",
        value: "Biaya material dan pemasangan tergolong tinggi dibandingkan perlengkapan jalan lainnya, dan membutuhkan alat berat serta tenaga kerja terlatih untuk instalasi.",
      },
      {
        title: "Biaya Perbaikan & Perencanaan Cermat",
        value: "Perbaikan pasca kecelakaan (penggantian pelat yang rusak) memerlukan biaya cukup besar, serta perencanaan titik pemasangan memerlukan kajian teknis lalu lintas yang cermat.",
      },
    ],
    createdAt: "01 Agu 2024, 10:20",
  },
  {
    id: "12",
    title: "Cat Coldplastic Merk DPS",
    category: "Material Marka Jalan – Cat Marka Jalan (Solvent Based)",
    categoryVariant: "green",
    imageUrl: "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80",
    description:
      "Cat coldplastic merk DPS adalah cat marka jalan berbasis pelarut (solvent based) berkualitas tinggi yang diproduksi oleh PT Dua Putra Srikandi. Produk ini telah mengantongi sertifikat Tingkat Komponen Dalam Negeri (TKDN) dari Kementerian Perindustrian dan telah melalui serangkaian uji laboratorium di Balai Besar Standardisasi dan Pelayanan Jasa Industri, sehingga kualitas dan keabsahannya terjamin secara resmi. Dengan kemasan 25 kg, cakupan pemakaian sekitar 0,5 kg per meter persegi, serta pengencer berbasis air, cat marka ini relatif mudah diaplikasikan di lapangan menggunakan metode spray, roller, maupun kuas, sehingga fleksibel digunakan untuk berbagai skala pekerjaan pengecatan marka jalan, mulai dari proyek kecil hingga proyek besar.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp60.000 – Rp65.000/kg" },
      { title: "Kemasan", value: "25 kg" },
      { title: "Pemakaian", value: "Sekitar 0,5 kg/m²" },
      { title: "Pengencer", value: "Air" },
      { title: "Aplikasi", value: "Bisa spray, roller, atau kuas" },
    ],
    suitableFor: [
      "Proyek Pemerintah & BUMN: Sangat direkomendasikan untuk pelaksanaan dan pengadaan proyek pemerintah, BUMN dan BUMD yang mewajibkan penggunaan produk dengan sertifikat TKDN resmi.",
      "Area Zona Khusus: Ideal untuk area jalan yang membutuhkan marka visual dengan warna khusus (merah atau hijau) seperti Zona Selamat Sekolah (ZOSS) atau jalur sepeda khusus.",
      "Jalan Bebas Tumpahan Bahan Bakar: Sangat cocok diaplikasikan pada permukaan jalan dan fasilitas yang minim risiko tumpahan bensin secara langsung.",
    ],
    kelebihan: [
      {
        title: "Tersertifikasi TKDN",
        value: "Memiliki nilai TKDN sebesar 30.30% hingga 31.01% sehingga sangat mendukung program peningkatan penggunaan produk dalam negeri (P3DN), dan telah lulus uji laboratorium di Balai Besar Standardisasi dan Pelayanan Jasa Industri.",
      },
      {
        title: "Aplikasi Fleksibel & Praktis",
        value: "Dapat diaplikasikan menggunakan spray, roller, maupun kuas sesuai kondisi lapangan, dengan pengencer berbasis air yang lebih praktis dan ramah dalam penanganan di lokasi kerja.",
      },
    ],
    kekurangan: [
      {
        title: "Harga Lebih Tinggi & Kemasan Besar",
        value: "Harga per kg relatif lebih tinggi dibandingkan cat marka konvensional non-sertifikasi, dan kemasan besar (25 kg) kurang fleksibel untuk kebutuhan pengecatan skala sangat kecil.",
      },
      {
        title: "Hasil Bergantung Keahlian & Penyimpanan",
        value: "Hasil aplikasi sangat bergantung pada keahlian aplikator dan ketepatan takaran pemakaian per m², serta perlu penyimpanan yang tepat agar kualitas cat tetap terjaga sebelum digunakan.",
      },
    ],
    createdAt: "29 Jul 2024, 15:45",
  },
  {
    id: "13",
    title: "Penerangan Jalan Umum (PJU)",
    category: "Perlengkapan Elektrikal Jalan – Pencahayaan",
    categoryVariant: "yellow",
    imageUrl: "https://images.unsplash.com/photo-1509391365360-2e959784a276?w=800&auto=format&fit=crop&q=80",
    description:
      "Penerangan Jalan Umum (PJU) adalah sistem pencahayaan yang dipasang di sepanjang ruas jalan untuk memberikan visibilitas yang memadai bagi pengendara dan pejalan kaki pada malam hari, sekaligus berperan penting dalam meningkatkan keamanan dan mengurangi angka kecelakaan lalu lintas akibat minimnya penerangan. Teknologi lampu LED yang digunakan pada PJU modern menawarkan efisiensi energi yang jauh lebih baik dibandingkan lampu konvensional seperti sodium atau merkuri, dengan intensitas cahaya yang lebih terang dan usia pakai yang lebih panjang. Selain sistem konvensional yang terhubung ke jaringan listrik PLN, tersedia pula PJU tenaga surya (PJU-TS) yang memanfaatkan panel surya dan baterai penyimpan daya, menjadikannya solusi ideal untuk lokasi yang belum terjangkau jaringan listrik atau sebagai upaya efisiensi biaya operasional jangka panjang. PJU menjadi salah satu perlengkapan jalan strategis yang banyak dibutuhkan pemerintah daerah, pengelola kawasan industri, dan pengembang perumahan untuk mendukung keselamatan dan kenyamanan pengguna jalan.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp3.500.000 – Rp8.000.000/titik (lengkap lampu LED, tiang & instalasi dasar, tergantung watt & tinggi tiang)" },
      { title: "Kemasan/Satuan", value: "Per titik" },
      { title: "Aplikasi/Pemasangan", value: "Pemasangan tiang, penarikan kabel jaringan, dan instalasi armatur lampu oleh teknisi kelistrikan" },
      { title: "Spesifikasi", value: "Lampu LED 30–150 watt, tiang oktagonal galvanis 7–13 m, tersedia sistem konvensional (PLN) maupun tenaga surya (PJU-TS)" },
    ],
    suitableFor: [
      "Jalan Kabupaten/Kota & Kawasan Industri: Dibutuhkan pada proyek jalan kabupaten/kota dan kawasan industri yang memerlukan penerangan memadai pada malam hari.",
      "Jalan Desa & Area Perumahan: Cocok untuk jalan desa dan area perumahan, termasuk lokasi tanpa akses PLN melalui sistem tenaga surya.",
    ],
    kelebihan: [
      {
        title: "Meningkatkan Keamanan & Hemat Energi",
        value: "Meningkatkan keamanan dan visibilitas jalan pada malam hari secara signifikan, dengan teknologi LED yang lebih hemat energi dan memiliki usia pakai lebih panjang.",
      },
      {
        title: "Opsi Tenaga Surya untuk Lokasi Terpencil",
        value: "Opsi tenaga surya cocok untuk lokasi tanpa akses jaringan listrik PLN, sekaligus turut mendukung penurunan angka kecelakaan akibat minimnya penerangan jalan.",
      },
    ],
    kekurangan: [
      {
        title: "Investasi Awal & Perawatan Berkala",
        value: "Investasi awal yang dibutuhkan cukup besar terutama untuk sistem tenaga surya, dengan panel surya dan baterai yang memerlukan perawatan serta penggantian berkala.",
      },
      {
        title: "Rawan Pencurian & Bergantung Jaringan PLN",
        value: "Rawan menjadi sasaran pencurian komponen, terutama kabel dan panel surya, sementara sistem konvensional bergantung pada ketersediaan dan kestabilan jaringan listrik PLN.",
      },
    ],
    createdAt: "25 Jul 2024, 08:30",
  },
  {
    id: "14",
    title: "Joint Sealant",
    category: "Material Perawatan & Perbaikan Jalan",
    categoryVariant: "blue",
    imageUrl: "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    description:
      "Joint sealant adalah material perawatan jalan yang berfungsi menutup celah, retakan, atau sambungan pada perkerasan jalan aspal maupun beton, dengan tujuan mencegah air dan material asing masuk ke dalam struktur jalan yang dapat mempercepat kerusakan seperti retak lanjut, pengelupasan, hingga lubang jalan (pothole). Bersifat elastis, joint sealant mampu mengikuti pergerakan atau pemuaian struktur jalan akibat perubahan suhu tanpa kehilangan daya rekatnya, sehingga sangat efektif digunakan pada sambungan pelat beton, retakan memanjang, maupun area pertemuan antara perkerasan lama dan baru. Dalam rangkaian pekerjaan marka dan perlengkapan jalan, joint sealant sering diaplikasikan terlebih dahulu pada permukaan yang retak atau bercelah sebelum dilakukan pengecatan marka jalan, agar hasil marka lebih rata dan tidak mudah terkelupas akibat kondisi permukaan yang tidak stabil.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp15.000 – Rp40.000/kg" },
      { title: "Kemasan", value: "Pail/kaleng 20–25 kg" },
      { title: "Pemakaian", value: "Bervariasi sesuai lebar & kedalaman celah (contoh: celah 0,5 cm x kedalaman 3 cm ± 8 meter lari/kg)" },
      { title: "Aplikasi", value: "Tuang panas (hot pour) untuk sambungan aspal/beton, atau dengan aplikator pistol untuk versi cold pour" },
    ],
    suitableFor: [
      "Persiapan Sebelum Pengecatan Marka: Digunakan sebagai tahap perawatan permukaan jalan sebelum aplikasi cat marka agar hasil akhir lebih optimal dan tahan lama.",
      "Sambungan Beton & Retakan Jalan: Cocok untuk ruas jalan dengan sambungan beton atau retakan yang perlu ditutup terlebih dahulu.",
    ],
    kelebihan: [
      {
        title: "Mencegah Kerusakan & Elastis",
        value: "Mencegah air dan material asing masuk ke dalam struktur jalan sehingga memperlambat kerusakan, serta bersifat elastis dan mampu mengikuti pergerakan struktur akibat perubahan suhu.",
      },
      {
        title: "Aplikasi Cepat & Permukaan Lebih Rata",
        value: "Aplikasi relatif cepat dan tidak memerlukan waktu penutupan jalan yang lama, serta membantu menghasilkan permukaan jalan yang lebih rata sebelum pengecatan marka.",
      },
    ],
    kekurangan: [
      {
        title: "Perlu Permukaan Ideal & Rentan Suhu Ekstrem",
        value: "Membutuhkan permukaan yang bersih dan kering saat aplikasi agar daya rekat maksimal, dan daya rekat dapat menurun pada kondisi suhu ekstrem atau permukaan yang terus bergerak.",
      },
      {
        title: "Perlu Perawatan Berkala & Bergantung Keahlian",
        value: "Perlu penggantian atau perawatan berkala pada area dengan lalu lintas sangat padat, serta hasil akhir sangat bergantung pada keahlian aplikator dan kualitas bahan yang digunakan.",
      },
    ],
    createdAt: "20 Jul 2024, 11:10",
  },
  {
    id: "15",
    title: "Wheel Stopper (Rubber / Beton)",
    category: "Perlengkapan Area Parkir",
    categoryVariant: "purple",
    imageUrl: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800&auto=format&fit=crop&q=80",
    description:
      "Wheel stopper atau pengganjal roda kendaraan berbahan karet fleksibel maupun beton kokoh untuk penataan slot parkir rapi, aman, dan melindungi dinding serta pembatas area parkir dari benturan kendaraan.",
    detailProduct: [
      { title: "Kisaran Harga", value: "Rp120.000 – Rp350.000/unit (rubber/beton)" },
      { title: "Kemasan/Satuan", value: "Per unit, lengkap dynabolt angkur" },
      { title: "Aplikasi/Pemasangan", value: "Dipasang menggunakan dynabolt pada permukaan lantai aspal atau beton" },
      { title: "Spesifikasi", value: "Bahan heavy duty rubber / beton bertulang, panjang 50–180 cm, stiker reflektif kuning" },
    ],
    suitableFor: [
      "Area Parkir Gedung & Mall: Membatasi posisi parkir mobil secara presisi dan teratur.",
      "Kawasan Perkantoran & Industri: Mengurangi risiko tabrakan kendaraan ke struktur bangunan.",
    ],
    kelebihan: [
      {
        title: "Pemasangan Cepat & Kokoh",
        value: "Sistem dynabolt membuat wheel stopper terpasang stabil dan tidak mudah bergeser meski sering terkena ban kendaraan.",
      },
      {
        title: "Visibilitas Jelas & Reflektif",
        value: "Dilengkapi elemen reflektif cerah sehingga tetap terlihat jelas di area parkir basement maupun luar ruangan minim pencahayaan.",
      },
    ],
    kekurangan: [
      {
        title: "Perlu Pengeboran Presisi",
        value: "Pemasangan membutuhkan titik pengeboran yang tepat agar dynabolt mengikat kuat pada lantai beton.",
      },
    ],
    createdAt: "18 Jul 2024, 10:00",
  },
];

export function getStoredProducts(): ProductPayload[] {
  if (typeof window === "undefined") return INITIAL_PRODUCTS_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS_DATA));
      return INITIAL_PRODUCTS_DATA;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure any newly added initial products (like ID 15) are also available
      const existingIds = new Set(parsed.map((p: ProductPayload) => String(p.id)));
      let updated = false;
      INITIAL_PRODUCTS_DATA.forEach((initProd) => {
        if (!existingIds.has(String(initProd.id))) {
          parsed.push(initProd);
          updated = true;
        }
      });
      if (updated) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return parsed;
    }
    return INITIAL_PRODUCTS_DATA;
  } catch {
    return INITIAL_PRODUCTS_DATA;
  }
}

export function saveStoredProducts(products: ProductPayload[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error("Failed to save products to localStorage", e);
    }
  }
}

export async function getConsistingProductCategories(): Promise<string[]> {
  const products = getStoredProducts();
  const cats = new Set<string>();
  products.forEach((p) => {
    if (p.category) cats.add(p.category);
  });
  return Array.from(cats);
}

export async function getProductById(id: string | number): Promise<ProductPayload | null> {
  const products = getStoredProducts();
  const found = products.find((p) => String(p.id) === String(id));
  return found || null;
}

export async function addProduct(
  data: Omit<ProductPayload, "id" | "createdAt">,
  imageFile?: File | null
): Promise<ProductPayload> {
  const products = getStoredProducts();
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const formattedDate = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  let imageUrl = data.imageUrl || null;
  if (imageFile) {
    imageUrl = URL.createObjectURL(imageFile);
  }

  const newProduct: ProductPayload = {
    ...data,
    id: String(Date.now()),
    imageUrl: imageUrl || "https://images.unsplash.com/photo-1545459720-aac8509eb02c?w=800&auto=format&fit=crop&q=80",
    createdAt: formattedDate,
    categoryVariant: data.categoryVariant || CATEGORY_VARIANT_MAP[data.category] || "green",
  };

  const updated = [newProduct, ...products];
  saveStoredProducts(updated);
  return newProduct;
}

export async function editProduct(
  id: string | number,
  data: Partial<ProductPayload>,
  imageFile?: File | null,
  imageRemoved?: boolean
): Promise<ProductPayload> {
  const products = getStoredProducts();
  let updatedProduct: ProductPayload | null = null;

  const updated = products.map((product) => {
    if (String(product.id) === String(id)) {
      let finalImageUrl = product.imageUrl;
      if (imageRemoved) {
        finalImageUrl = null;
      }
      if (imageFile) {
        finalImageUrl = URL.createObjectURL(imageFile);
      } else if (data.imageUrl !== undefined) {
        finalImageUrl = data.imageUrl;
      }

      const nextCategory = data.category !== undefined ? data.category : product.category;

      updatedProduct = {
        ...product,
        ...data,
        imageUrl: finalImageUrl,
        categoryVariant:
          data.categoryVariant || CATEGORY_VARIANT_MAP[nextCategory] || product.categoryVariant || "green",
      };
      return updatedProduct;
    }
    return product;
  });

  if (!updatedProduct) {
    throw new Error(`Product with id ${id} not found.`);
  }

  saveStoredProducts(updated);
  return updatedProduct;
}

export async function deleteProduct(id: string | number): Promise<void> {
  const products = getStoredProducts();
  const nextProducts = products.filter((p) => String(p.id) !== String(id));
  saveStoredProducts(nextProducts);
}
