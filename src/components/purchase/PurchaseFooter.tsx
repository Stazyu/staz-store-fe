import { PaymentMethod, PaymentMethodCategory } from "@/types/paymentMethod";
import { PurchaseFooterProps } from "@/types/purchase";

// Type guard to check if an item is a PaymentMethodCategory
function isPaymentMethodCategory(item: unknown): item is PaymentMethodCategory {
    return typeof item === 'object' &&
        item !== null &&
        'methods' in item &&
        Array.isArray((item as PaymentMethodCategory).methods);
}

export default function PurchaseFooter({ isMobile, selectedOption, formData, finalPrice, isSubmitting, isIdVerified, PAYMENT_METHODS }: PurchaseFooterProps) {
    // Get the current method, handling both flat and categorized structures
    const currentMethod = (() => {
        if (!formData.paymentMethod) return undefined;

        // If it's a categorized structure
        if (PAYMENT_METHODS.length > 0 && isPaymentMethodCategory(PAYMENT_METHODS[0])) {
            const categories = PAYMENT_METHODS as PaymentMethodCategory[];
            for (const category of categories) {
                const method = category.methods.find(m => m.id === formData.paymentMethod);
                if (method) return method;
            }
            return undefined;
        }

        // If it's a flat structure
        return (PAYMENT_METHODS as unknown as PaymentMethod[]).find(m => m.id === formData.paymentMethod);
    })();

    const hasFee = Boolean(currentMethod?.fee && currentMethod.fee > 0);

    return (
        <div className={`p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${isMobile ? '' : ''}`}>
            <div className="bg-gray-50 p-3 rounded-lg mb-3 dark:bg-gray-700">
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-300">Harga Awal:</span>
                    <span className="text-gray-600 dark:text-gray-300">Rp {selectedOption.price.toLocaleString('id-ID')}</span>
                </div>
                {hasFee && currentMethod && (
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-300">Biaya Admin:</span>
                        <span className="text-red-500 dark:text-red-400">
                            +Rp {(currentMethod.feeType === 'percentage' ? selectedOption.price * currentMethod.fee : currentMethod.fee).toLocaleString('id-ID')}
                        </span>
                    </div>
                )}
                <div className="flex justify-between font-medium pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-300">Total:</span>
                    <span className="text-blue-600 dark:text-blue-200 text-lg font-bold">
                        Rp {finalPrice.toLocaleString('id-ID')}
                    </span>
                </div>
            </div>
            <button
                type="submit"
                form="purchase-form"
                disabled={isSubmitting || !isIdVerified || !formData.paymentMethod}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
            >
                {isSubmitting ? 'Memproses...' : 'Beli Sekarang'}
            </button>
            <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                Dengan menekan tombol ini, Anda menyetujui Syarat & Ketentuan yang berlaku
            </p>
        </div>
    );
}
