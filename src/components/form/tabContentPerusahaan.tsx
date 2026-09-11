"use client";

import InputBox from "@/components/ui/inputBox";
import DescriptionBox from "@/components/ui/descriptionBox";
import type { SiteContentRow } from "@/services/siteContentApi";
import SectionHeading from "@/components/ui/sectionHeading";

interface TabContentPerusahaanProps {
  data: SiteContentRow;
  onChange: (updater: (prev: SiteContentRow) => SiteContentRow) => void;
}

export default function TabContentPerusahaan({
  data,
  onChange,
}: TabContentPerusahaanProps) {
  // Helper to read social link supporting array and legacy object formats
  const getSocialLink = (platform: string): string => {
    if (!data.social_media) return "";
    if (Array.isArray(data.social_media)) {
      const item = data.social_media.find(
        (s: any) => s && (s.type === platform || s.platform === platform)
      );
      return item ? item.link || item.url || "" : "";
    }
    if (typeof data.social_media === "object") {
      return (data.social_media as Record<string, string>)[platform] || "";
    }
    return "";
  };

  // Helper to save social media as JSON array: [{ type: "instagram", link: "..." }]
  const updateSocialMedia = (platform: string, value: string) => {
    const platforms = [
      "instagram",
      "threads",
      "linkedin",
      "facebook",
      "youtube",
      "tiktok",
      "twitter",
    ];

    const currentMap: Record<string, string> = {};
    platforms.forEach((p) => {
      currentMap[p] = getSocialLink(p);
    });
    currentMap[platform] = value;

    const newArray = platforms
      .filter((p) => currentMap[p].trim() !== "")
      .map((p) => ({
        type: p,
        link: currentMap[p].trim(),
        url: currentMap[p].trim(),
      }));

    onChange((prev) => ({
      ...prev,
      social_media: newArray,
    }));
  };

  return (
    <div className="flex flex-col gap-6 w-full animate-fadeIn">
      {/* 1. Detail Perusahaan */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={1}
          title="Detail Perusahaan"
          info="Saluran komunikasi utama perusahaan: nomor telepon kantor, alamat email resmi, tautan WhatsApp CS, dan alamat lengkap kantor & workshop."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InputBox
            label="Nomor Telepon *"
            placeholder="+62 21 8899 0011"
            value={data.phone || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, phone: e.target.value }))
            }
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="Email *"
            placeholder="info@duaputrasrikandi.co.id"
            type="email"
            value={data.email || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, email: e.target.value }))
            }
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="Tautan Whatsapp *"
            placeholder="https://wa.me/6281234567890"
            value={data.whatsapp_url || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, whatsapp_url: e.target.value }))
            }
            containerClassName="max-w-none w-full"
          />
        </div>

        {/* Alamat Lengkap */}
        <div className="flex flex-col gap-1.5 w-full">
          <DescriptionBox
            label="Alamat Kantor *"
            placeholder="Alamat kantor pusat, workshop manufaktur, dan lokasi operasional..."
            value={data.address || ""}
            onChange={(e) =>
              onChange((prev) => ({ ...prev, address: e.target.value }))
            }
            rows={3}
            containerClassName="max-w-none w-full"
          />
        </div>
      </section>

      {/* 2. Social Media */}
      <section className="flex flex-col gap-5 p-4 sm:p-6 bg-white rounded-2xl sm:rounded-3xl border border-white-80 hover:border-g1 transition-colors duration-200">
        <SectionHeading
          number={2}
          title="Social Media"
          info="Tautan akun profil media sosial resmi Dua Putra Srikandi di berbagai platform: Instagram, Threads, LinkedIn, Facebook, YouTube, TikTok, dan X/Twitter."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <InputBox
            label="Instagram URL"
            placeholder="https://instagram.com/duaputrasrikandi"
            value={getSocialLink("instagram")}
            onChange={(e) => updateSocialMedia("instagram", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="Threads URL"
            placeholder="https://threads.net/@duaputrasrikandi"
            value={getSocialLink("threads")}
            onChange={(e) => updateSocialMedia("threads", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="LinkedIn URL"
            placeholder="https://linkedin.com/company/duaputrasrikandi"
            value={getSocialLink("linkedin")}
            onChange={(e) => updateSocialMedia("linkedin", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="Facebook URL"
            placeholder="https://facebook.com/duaputrasrikandi"
            value={getSocialLink("facebook")}
            onChange={(e) => updateSocialMedia("facebook", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="YouTube URL"
            placeholder="https://youtube.com/@duaputrasrikandi"
            value={getSocialLink("youtube")}
            onChange={(e) => updateSocialMedia("youtube", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="TikTok URL"
            placeholder="https://tiktok.com/@duaputrasrikandi"
            value={getSocialLink("tiktok")}
            onChange={(e) => updateSocialMedia("tiktok", e.target.value)}
            containerClassName="max-w-none w-full"
          />

          <InputBox
            label="X / Twitter URL"
            placeholder="https://x.com/duaputrasrikandi"
            value={getSocialLink("twitter")}
            onChange={(e) => updateSocialMedia("twitter", e.target.value)}
            containerClassName="max-w-none w-full"
          />
        </div>
      </section>
    </div>
  );
}
