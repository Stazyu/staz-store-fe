import { TopUpCardProps } from '@/types/topUpCard';
import React from 'react';

const currencyLabels = {
  diamonds: 'Diamonds',
  uc: 'UC',
  crystals: 'Crystals',
  points: 'Points',
  lunites: 'Lunites'
};

export default function TopUpCard({ option, currency, onSelect }: TopUpCardProps) {
  const amount = option[currency as keyof typeof option] as number;
  const isBonus = Boolean(option.bonus && option.bonus > 0);

  return (
    <div
      onClick={() => onSelect(option)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full flex flex-col"
    >
      <div className="text-center flex-grow">
        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{amount + (option.bonus || 0)}</div>
        <div className="text-xs text-gray-500 mb-1">{currencyLabels[currency]}</div>

        {isBonus && (
          <div className="text-[10px] bg-yellow-50 dark:bg-yellow-600 text-yellow-700 dark:text-yellow-200 rounded-full px-2 py-0.5 inline-block mb-1.5">
            {amount} + {option.bonus}
            <span className="ml-1">{currencyLabels[currency]}</span>
          </div>
        )}

        <div className="mt-1">
          <div className="text-gray-400 text-xs line-through">
            Rp {(option.price + (option.price * 0.10)).toLocaleString('id-ID')}
          </div>
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            Rp {option.price.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      <button
        className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-3 rounded-md text-sm font-medium transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        onClick={(e) => {
          e.stopPropagation();
          onSelect(option);
        }}
      >
        Beli
      </button>
    </div>
  );
}
