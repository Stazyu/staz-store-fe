// types/ui.d.ts
declare module '@/components/ui/label' {
    export const Label: React.FC<{ htmlFor?: string; className?: string; children: React.ReactNode }>;
}

declare module '@/components/ui/textarea' {
    export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>>;
}

declare module '@/components/ui/switch' {
    export const Switch: React.FC<{
        checked?: boolean;
        onCheckedChange?: (checked: boolean) => void;
        className?: string;
        disabled?: boolean;
        id?: string;
    }>;
}

// declare module '@/components/ui/select' {
//     export const Select: React.FC<{
//         value?: string;
//         onValueChange?: (value: string) => void;
//         children: React.ReactNode;
//     }>;
//     export const SelectTrigger: React.FC<{ className?: string; children: React.ReactNode }>;
//     export const SelectValue: React.FC<{ placeholder?: string }>;
//     export const SelectContent: React.FC<{ children: React.ReactNode }>;
//     export const SelectItem: React.FC<{ value: string; children: React.ReactNode }>;
// }

declare module '@/components/ui/tabs' {
    export const Tabs: React.FC<{
        value?: string;
        onValueChange?: (value: string) => void;
        className?: string;
        children: React.ReactNode
    }>;
    export const TabsList: React.FC<{ className?: string; children: React.ReactNode }>;
    export const TabsTrigger: React.FC<{
        value: string;
        className?: string;
        children: React.ReactNode
    }>;
    export const TabsContent: React.FC<{
        value: string;
        className?: string;
        children: React.ReactNode
    }>;
}

declare module '@/components/ui/badge' {
    export const Badge: React.FC<{
        variant?: 'default' | 'secondary' | 'destructive' | 'outline';
        className?: string;
        children: React.ReactNode
    }>;
}