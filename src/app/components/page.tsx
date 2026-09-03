"use client";

import { useState } from "react";
import Button from "@/components/ui/button";
import DescriptionBox from "@/components/ui/descriptionBox";
import Dropdown, { type DropdownOption } from "@/components/ui/dropdown";
import MediaCard from "@/components/ui/mediaCard";
import Notification, { type NotificationType } from "@/components/ui/notification";
import Pagination from "@/components/ui/pagination";
import Badge, { type BadgeVariant } from "@/components/ui/badge";
import UploadFile from "@/components/ui/uploadFile";
import DeleteConfirmationModal from "@/components/ui/modal/deleteConfirmation";
import InputBox from "@/components/ui/inputBox";
import Sidebar from "@/components/layout/sidebar";
import Navbar from "@/components/layout/navbar";

export default function ComponentsShowcasePage() {
  // Notification state
  const [notification, setNotification] = useState<{
    isOpen: boolean;
    message: string;
    type: NotificationType;
  }>({
    isOpen: false,
    message: "",
    type: "default",
  });

  const triggerNotif = (message: string, type: NotificationType = "default") => {
    setNotification({ isOpen: true, message, type });
  };

  // Dropdown state
  const dropdownOptions: DropdownOption[] = [
    { value: "general", label: "General News" },
    { value: "events", label: "School Events" },
    { value: "announcements", label: "Official Announcements" },
    { value: "academic", label: "Academic Calendar" },
    { value: "sports", label: "Sports & Activities" },
  ];
  const [singleDropdownValue, setSingleDropdownValue] = useState("general");
  const [multiDropdownValue, setMultiDropdownValue] = useState<string[]>([
    "general",
    "events",
  ]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Sidebar active state
  const [sidebarActiveId, setSidebarActiveId] = useState("users");

  // Description state
  const [descValue, setDescValue] = useState("");

  const badgeVariants: BadgeVariant[] = [
    "green",
    "red",
    "blue",
    "yellow",
    "purple",
    "gray",
    "indigo",
    "orange",
  ];

  return (
    <div className="min-h-screen bg-white-90 text-dark px-4 py-8 md:px-12 md:py-12">
      {/* Toast Notification */}
      <Notification
        isOpen={notification.isOpen}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          triggerNotif("Item deleted successfully!", "success");
        }}
        title="Delete Content Item"
        message="Are you sure you want to remove this item? This action cannot be reversed."
      />

      <div className="max-w-6xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <header className="border-b border-white-80 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-g1 uppercase tracking-widest">
              DPS CMS • Design System
            </span>
            <h1 className="text-3xl md:text-4xl font-bold mt-1 text-dark">
              UI Components Showcase
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Preview and test all UI components with the updated Figma styling and brand palette.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-g1/15 text-g1 text-xs font-semibold rounded-full border border-g1/30">
              Tailwind v4
            </span>
            <span className="px-3 py-1 bg-dark text-white-100 text-xs font-semibold rounded-full">
              Open Sans
            </span>
          </div>
        </header>

        {/* --- SECTION 1: BUTTONS --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-dark">1. Buttons (Figma Variants)</h2>
              <p className="text-sm text-slate-500">
                All 8 Figma button variants with icon support and segmented pill designs.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Variants */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white-90 border border-white-80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Standard Styles
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  text="Support Our Mission"
                  variant="fill"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Support Our Mission"
                  variant="stroke"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Support Our Mission"
                  variant="ghost-green"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Disabled Button"
                  variant="fill"
                  leftIcon="Heart"
                  disabled
                />
              </div>
            </div>

            {/* Glass & Ghost White (on dark container) */}
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-dark text-white border border-dark">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white-70">
                Dark Container (Glass & White)
              </h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  text="Support Our Mission"
                  variant="glass"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Support Our Mission"
                  variant="ghost-white"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="White Stroke"
                  variant="outline-white"
                  leftIcon="Heart"
                />
              </div>
            </div>

            {/* Unique Segmented Variants */}
            <div className="md:col-span-2 flex flex-col gap-4 p-5 rounded-2xl bg-white-90 border border-white-80">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Unique Segmented Variants (Three-Pill Design)
              </h3>
              <div className="flex flex-wrap items-center gap-4">
                <Button
                  text="Support Our Mission"
                  variant="unique-green"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Support Our Mission"
                  variant="unique-stroke"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
                <Button
                  text="Support Our Mission"
                  variant="unique-white"
                  leftIcon="Heart"
                  rightIcon="Heart"
                />
              </div>
            </div>
          </div>
        </section>

        {/* --- SECTION 2: INPUTS & DESCRIPTION BOX --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">2. Inputs & Description Box</h2>
            <p className="text-sm text-slate-500">
              Form inputs with focus rings, icons, and textarea wrappers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <InputBox
                label="Full Name"
                placeholder="Enter full name..."
                leftIcon="Add"
              />
              <InputBox
                label="Search Keyword"
                placeholder="Search articles, students, faculty..."
                leftIcon="Image 2"
              />
            </div>
            <div>
              <DescriptionBox
                label="Article Summary / Description"
                placeholder="Enter detailed description here..."
                rows={4}
                value={descValue}
                onChange={(e) => setDescValue(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 3: DROPDOWNS --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">3. Dropdown Selects</h2>
            <p className="text-sm text-slate-500">
              Single-select and multi-select with search and tag chips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Dropdown
              label="Single Selection"
              placeholder="Choose category..."
              options={dropdownOptions}
              value={singleDropdownValue}
              onChange={(val) => setSingleDropdownValue(val as string)}
            />

            <Dropdown
              label="Multiple Selection (with custom add)"
              placeholder="Select tags..."
              multiple={true}
              allowCustomValues={true}
              options={dropdownOptions}
              value={multiDropdownValue}
              onChange={(val) => setMultiDropdownValue(val as string[])}
            />
          </div>
        </section>

        {/* --- SECTION 4: BADGES --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">4. Badges & Status Indicators</h2>
            <p className="text-sm text-slate-500">
              Status tags with accent dots and color fills.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {badgeVariants.map((variant) => (
              <Badge
                key={variant}
                text={`Status ${variant.toUpperCase()}`}
                variant={variant}
                showDot={true}
              />
            ))}
            <Badge text="No Dot Badge" variant="green" showDot={false} />
          </div>
        </section>

        {/* --- SECTION 5: NOTIFICATIONS & MODALS --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">5. Interactive Modals & Notifications</h2>
            <p className="text-sm text-slate-500">
              Trigger toasts and confirmation dialogs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              text="Show Success Toast"
              variant="fill"
              onClick={() => triggerNotif("Operation completed successfully!", "success")}
            />
            <Button
              text="Show Error Toast"
              variant="stroke"
              onClick={() => triggerNotif("An error occurred while processing request.", "error")}
            />
            <Button
              text="Show Info Toast"
              variant="ghost-green"
              onClick={() => triggerNotif("System update is scheduled for midnight.", "default")}
            />
            <Button
              text="Open Delete Modal"
              variant="stroke"
              onClick={() => setIsDeleteModalOpen(true)}
            />
          </div>
        </section>

        {/* --- SECTION 6: MEDIA CARDS --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">6. Media Cards (Grid & List)</h2>
            <p className="text-sm text-slate-500">
              Display cards for media library items with preview and delete action.
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grid Layout
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MediaCard
                imageUrl="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop&q=80"
                fileName="campus-entrance.webp"
                fileSize="342 KB"
                onDelete={() => triggerNotif("Deleted campus-entrance.webp", "success")}
              />
              <MediaCard
                imageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80"
                fileName="annual-sports-meet.webp"
                fileSize="512 KB"
                onDelete={() => triggerNotif("Deleted annual-sports-meet.webp", "success")}
              />
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-2">
              List Layout
            </h3>
            <div className="flex flex-col gap-3 max-w-lg">
              <MediaCard
                layout="list"
                imageUrl="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80"
                fileName="science-laboratory-lab.webp"
                fileSize="1.2 MB"
                onDelete={() => triggerNotif("Deleted science-laboratory-lab.webp", "success")}
              />
            </div>
          </div>
        </section>

        {/* --- SECTION 7: UPLOAD FILE --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">7. Upload File Component</h2>
            <p className="text-sm text-slate-500">
              Drag & drop upload zone with media library picker integration.
            </p>
          </div>

          <div className="max-w-xl">
            <UploadFile
              label="Upload School Banner"
              descriptionPrefix="Recommended Size"
              descriptionValue="(1200px * 630px)"
              multiple={true}
              maxFiles={4}
            />
          </div>
        </section>

        {/* --- SECTION 8: PAGINATION --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">8. Pagination</h2>
            <p className="text-sm text-slate-500">
              Paginated page indicator with previous, next, and active states.
            </p>
          </div>

          <div className="p-4 bg-white-90 rounded-2xl">
            <Pagination
              currentPage={currentPage}
              totalItems={85}
              itemsPerPage={10}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        </section>

        {/* --- SECTION 9: SIDEBAR NAVIGATION COMPONENT --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">9. Sidebar Component (Figma Menu Bar)</h2>
            <p className="text-sm text-slate-500">
              Interactive menu navigation using <code>variant="fill"</code> for active item and <code>variant="ghost-green"</code> for inactive items.
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-8 bg-brand-background p-6 rounded-2xl">
            <Sidebar
              activeId={sidebarActiveId}
              onSelect={(id) => {
                setSidebarActiveId(id);
                triggerNotif(`Navigated to ${id.toUpperCase()}`, "default");
              }}
            />
            <div className="flex-1 flex flex-col gap-3 p-6 bg-white rounded-2xl border border-white-80 shadow-xs self-stretch justify-center">
              <span className="text-xs font-bold text-g1 uppercase tracking-widest">
                Active Route Preview
              </span>
              <h3 className="text-2xl font-bold text-dark">
                Selected Menu: <span className="text-g1 capitalize">{sidebarActiveId}</span>
              </h3>
              <p className="text-sm text-slate-500">
                Clicking any item smoothly transitions the active state using the solid green Fill button, while other items remain in subtle Ghost Green.
              </p>
            </div>
          </div>
        </section>

        {/* --- SECTION 10: NAVBAR COMPONENT --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">10. Navbar Component (Figma Top Bar)</h2>
            <p className="text-sm text-slate-500">
              Top bar navigation with brand title, super admin profile details, and Unique Red Logout button.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white-80 shadow-xs">
            <Navbar
              brandTitle="Dua Putra Srikandi"
              userName="Username"
              userRole="Super Admin"
              onLogout={() => triggerNotif("Logged out successfully", "error")}
            />
          </div>
        </section>

        {/* --- SECTION 11: COLOR PALETTE REFERENCE --- */}
        <section className="bg-white rounded-3xl p-6 md:p-8 border border-white-80 shadow-xs flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-dark">11. Color Palette Reference</h2>
            <p className="text-sm text-slate-500">
              Tokens configured in CSS variables and Tailwind v4.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-g1 text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Brand G1</span>
              <span className="text-xs font-mono opacity-90">#0A9863</span>
            </div>
            <div className="p-4 rounded-2xl bg-g2 text-dark flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Brand G2</span>
              <span className="text-xs font-mono opacity-90">#06D07A</span>
            </div>
            <div className="p-4 rounded-2xl bg-g3 text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Brand G3</span>
              <span className="text-xs font-mono opacity-90">#034F04</span>
            </div>
            <div className="p-4 rounded-2xl bg-dark text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Dark</span>
              <span className="text-xs font-mono opacity-90">#110D31</span>
            </div>
            <div className="p-4 rounded-2xl bg-red-state text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Red State</span>
              <span className="text-xs font-mono opacity-90">#F94C4C</span>
            </div>
            <div className="p-4 rounded-2xl bg-green-state text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Green State</span>
              <span className="text-xs font-mono opacity-90">#57C439</span>
            </div>
            <div className="p-4 rounded-2xl bg-blue-state text-white flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Blue State</span>
              <span className="text-xs font-mono opacity-90">#4C94F9</span>
            </div>
            <div className="p-4 rounded-2xl bg-yellow-state text-dark flex flex-col justify-between h-24">
              <span className="font-semibold text-sm">Yellow State</span>
              <span className="text-xs font-mono opacity-90">#FFD84A</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
