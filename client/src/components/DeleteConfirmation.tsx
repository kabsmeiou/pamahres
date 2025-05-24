import { Loader, Trash2, AlertTriangle, X } from 'react-feather';

interface DeleteConfirmationProps {
    showDeleteConfirm: boolean;
    setShowDeleteConfirm: (show: boolean) => void;
    isDeleting: boolean;
    handleDelete: () => void;
    itemName: string;
    itemType: 'Material' | 'Quiz';
}

// improve ux by handling deletion on backend and instantly removing the frontend item(card) after confirmation.
// instead of loading in the popup delete confirmation, have a loading component on the top right that shows the user a toast that the item is being deleted.

const DeleteConfirmation = ({ 
    showDeleteConfirm, 
    setShowDeleteConfirm, 
    isDeleting, 
    handleDelete, 
    itemName,
    itemType 
}: DeleteConfirmationProps) => {
    if (!showDeleteConfirm) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4 transition-opacity duration-200 backdrop-blur-sm">
            <div 
                className="bg-white rounded-lg max-w-md w-full mx-auto shadow-xl transform transition-all duration-300 animate-fadeIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-5 flex items-start justify-between border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="text-red-500" size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Delete {itemType}</h3>
                            <p className="text-gray-500 text-sm">This action cannot be undone</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowDeleteConfirm(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={isDeleting}
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>
                
                {/* Content */}
                <div className="p-5">
                    <p className="text-gray-600 mb-2">
                        Are you sure you want to delete:
                    </p>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-800 font-medium mb-4">
                        "{itemName}"
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-6">
                        All associated data will be permanently removed from our servers.
                    </p>
                    
                    {/* Buttons */}
                    <div className="flex justify-end items-center gap-3 pt-2">
                        <button
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-2 font-medium shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader size={16} className="animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    <span>Delete</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation;