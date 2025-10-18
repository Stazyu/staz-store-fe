import AppLayout from "@/components/layout/AppLayout";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <AppLayout>
            {children}
        </AppLayout>
    );
}
