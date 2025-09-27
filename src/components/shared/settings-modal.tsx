import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useCallback, useEffect, useState } from "react";

export interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onApply: (gender: "male" | "female") => void;
    currentGender: "male" | "female";
}

export const SettingsModal = ({
    isOpen,
    onClose,
    onApply,
    currentGender,
}: SettingsModalProps) => {
    const [selectedGender, setSelectedGender] = useState<"male" | "female">(
        currentGender
    );

    // Update internal state when currentGender prop changes
    useEffect(() => {
        setSelectedGender(currentGender);
    }, [currentGender]);

    const handleToggleChange = useCallback(
        (
            _event: React.MouseEvent<HTMLElement>,
            newGender: "male" | "female"
        ) => {
            if (newGender !== null) {
                setSelectedGender(newGender);
            }
        },
        []
    );

    const handleApply = useCallback(() => {
        onApply(selectedGender);
    }, [selectedGender, onApply]);

    const handleCancel = useCallback(() => {
        // Reset to current gender and close
        setSelectedGender(currentGender);
        onClose();
    }, [currentGender, onClose]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            onClick={handleCancel}
        >
            <div
                className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Settings
                    </h3>
                </div>

                <p className="mb-4 text-sm text-gray-600">
                    Choose which gender to view in ratings:
                </p>

                <div className="mb-6">
                    <ToggleButtonGroup
                        value={selectedGender}
                        exclusive
                        onChange={handleToggleChange}
                        aria-label="gender selection"
                        fullWidth
                        sx={{
                            width: "100%",
                            "& .MuiToggleButtonGroup-root": {
                                width: "100%",
                            },
                            "& .MuiToggleButton-root": {
                                flex: 1,
                                border: "2px solid #374151",
                                borderRadius: "12px",
                                padding: "12px 24px",
                                margin: "0 4px",
                                textTransform: "none",
                                fontSize: "16px",
                                fontWeight: 600,
                                color: "#374151",
                                backgroundColor: "transparent",
                                transition: "all 0.2s ease-in-out",
                                "&:first-of-type": {
                                    marginLeft: 0,
                                    borderTopRightRadius: "12px",
                                    borderBottomRightRadius: "12px",
                                },
                                "&:last-of-type": {
                                    marginRight: 0,
                                    borderTopLeftRadius: "12px",
                                    borderBottomLeftRadius: "12px",
                                },
                                "&.Mui-selected": {
                                    backgroundColor: "#111827",
                                    color: "#ffffff",
                                    borderColor: "#111827",
                                    transform: "translateY(-1px)",
                                    boxShadow:
                                        "0 4px 12px rgba(17, 24, 39, 0.3)",
                                    "&:hover": {
                                        backgroundColor: "#1f2937",
                                        borderColor: "#1f2937",
                                    },
                                },
                                "&:hover": {
                                    backgroundColor: "#f3f4f6",
                                    borderColor: "#6b7280",
                                    transform: "translateY(-1px)",
                                },
                            },
                        }}
                    >
                        <ToggleButton value="female">Women</ToggleButton>
                        <ToggleButton value="male">Men</ToggleButton>
                    </ToggleButtonGroup>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={handleCancel}
                        className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 rounded-md bg-gray-800 px-4 py-2 font-medium text-white transition-colors hover:bg-gray-900 focus:ring-gray-700"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    );
};
