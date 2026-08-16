import { SubNav } from "@/components/shared/sub-nav";

const NAV = [
  { label: "Profile", href: "/settings/profile" },
  { label: "Appearance", href: "/settings/appearance" },
  { label: "Notifications", href: "/settings/notifications" },
  { label: "Integrations", href: "/settings/integrations" },
  { label: "AI", href: "/settings/ai" },
  { label: "Data", href: "/settings/data" },
  { label: "Security", href: "/settings/security" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your account, appearance, and data.</p>
      </div>
      <SubNav items={NAV} />
      {children}
    </div>
  );
}
