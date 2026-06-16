import type { Metadata } from "next";
import SettingsContent from "@/features/admin/settings/components/settings-content";

export const metadata: Metadata = {
  title: "Pengaturan | Admin",
};

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <SettingsContent />
    </div>
  );
}
