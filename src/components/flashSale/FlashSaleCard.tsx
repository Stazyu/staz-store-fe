import { useState } from "react";
import Image from "next/image";
import { ProductCardProps } from "@/types/game.types";
import PurchaseForm from "@/components/forms/PurchaseForm";

interface PurchaseFormSubmitData {
    playerId: string;
    nickname: string;
    server?: string;
    serverId?: string;
    phoneNumber: string;
    paymentMethod: string;
    amount: number;
    price: number;
    currency: string;
    game: string;
    orderId: string;
}

export default function FlashSaleCard({
    id,
    title,
    game,
    price,
    oldPrice,
    discount,
    stock,
    soldOut,
    image,
}: ProductCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleCardClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Always open the modal, regardless of soldOut status
        setIsModalOpen(true);
        // If you want to handle soldOut status differently within the modal or prevent opening,
        // that logic can be added here or passed to the PurchaseForm.
        // For now, per request, we always open it.
        // if (soldOut) {
        //     console.log("Item is sold out, but opening form as requested.");
        // }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = (data: PurchaseFormSubmitData) => {
        console.log('Purchase data:', {
            productId: id,
            productName: title,
            ...data,
            game,
            price
        });
        // You can add your API call here
        setIsModalOpen(false);
    };

    // Create a selected option that matches the TopUpCardProps['option'] type
    const selectedOption = {
        id: parseInt(id), // Convert string ID to number to match the expected type
        price,
        // Add other required properties with default values
        diamonds: 0,
        uc: 0,
        crystals: 0,
        points: 0,
        lunites: 0,
        amount: 1
    };

    return (
        <div className="relative">
            <div
                onClick={handleCardClick}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 border border-gray-100 dark:border-gray-700 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full flex flex-col"
            >
                <div className="relative w-full h-28 overflow-hidden rounded-md mb-2">
                    <Image
                        src={image}
                        className="w-full h-full object-cover"
                        alt={title}
                        width={200}
                        height={200}
                    />
                </div>
                <div className="flex-grow">
                    <h3 className="text-sm font-semibold line-clamp-1 dark:text-white">{title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-300 mb-1">{game}</p>
                    <div className="flex items-center justify-between mb-0.5">
                        <span className="text-base font-semibold text-blue-600 dark:text-blue-400">
                            Rp{price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 rounded-full">
                            -{discount}%
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 line-through mb-2">
                        Rp{oldPrice.toLocaleString('id-ID')}
                    </p>
                    {soldOut ? (
                        <div className="text-xs bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 rounded-full px-2 py-0.5 inline-block">
                            Habis
                        </div>
                    ) : (
                        <div className="text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-full px-2 py-0.5 inline-block">
                            {stock} Tersedia
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <PurchaseForm
                    selectedOption={selectedOption}
                    currency=""
                    gameTitle={game}
                    isAuthenticated={false}
                    onClose={handleCloseModal}
                    onSubmit={handleSubmit}
                />
            )}
        </div>
    );
}
