'use client';

import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';
import { PaymentMethodCategory } from '@/types/paymentMethod';

export default function PaymentAccordion({
    groupedMethods,
    formData,
    handleChange,
    hasSufficientBalance,
}: {
    groupedMethods: PaymentMethodCategory[];
    formData: { paymentMethod: string };
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasSufficientBalance: boolean;
}) {
    return (
        <div className="space-y-4">
            {groupedMethods.map((group, i) => (
                <Disclosure key={i} as="div" className="mb-2">
                    {() => (
                        <>
                            <Disclosure.Button className="flex justify-between w-full bg-gray-800 text-white px-4 py-2 rounded-md">
                                {({ open }) => (
                                    <>
                                        <span>{group.name}</span>
                                        <ChevronUpIcon
                                            className={`h-5 w-5 transform transition-transform ${open ? '' : 'rotate-180'}`}
                                        />
                                    </>
                                )}
                            </Disclosure.Button>
                            <Disclosure.Panel className="grid grid-cols-2 gap-2 mt-2">
                                {group.methods.map((method) => {
                                    const isBalanceMethod = method.id === 'balance';
                                    const isDisabled = isBalanceMethod && !hasSufficientBalance;

                                    return (
                                        <label
                                            key={method.id}
                                            className={`flex items-center p-3 border rounded-lg ${formData.paymentMethod === method.id
                                                ? 'border-blue-500 bg-blue-50 dark:border-blue-500 dark:bg-blue-600 cursor-pointer'
                                                : isDisabled
                                                    ? 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700 cursor-not-allowed'
                                                    : 'border-gray-300 hover:border-blue-500 dark:border-gray-700 dark:hover:border-blue-500 cursor-pointer'
                                                } ${isDisabled ? 'opacity-60' : ''}`}
                                            title={isDisabled ? 'Saldo tidak mencukupi' : ''}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value={method.id}
                                                checked={formData.paymentMethod === method.id}
                                                onChange={handleChange}
                                                disabled={isDisabled}
                                                className={`h-4 w-4 ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 focus:ring-blue-500'
                                                    } border-gray-300 dark:border-gray-700`}
                                            />
                                            <div className="ml-2">
                                                <div className="text-sm dark:text-gray-300">
                                                    {method.icon} {method.name}
                                                    {isBalanceMethod && !hasSufficientBalance && (
                                                        <span className="ml-1 text-xs text-red-500">(Tidak cukup)</span>
                                                    )}
                                                </div>
                                                {method.fee > 0 && (
                                                    <div className="text-xs text-gray-500 dark:text-gray-300">
                                                        +Rp {method.fee.toLocaleString('id-ID')} admin
                                                    </div>
                                                )}
                                                {method.fee === 0 && !isBalanceMethod && (
                                                    <div className="text-xs text-green-500 dark:text-green-400">
                                                        Tanpa biaya admin
                                                    </div>
                                                )}
                                            </div>
                                        </label>
                                    );
                                })}
                            </Disclosure.Panel>
                        </>
                    )}
                </Disclosure>
            ))}
        </div>
    );
}
