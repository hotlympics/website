import { useEffect, useState } from "react";

export const usePagination = <T>(items: T[], itemsPerPage: number = 10) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedItems = items.slice(startIndex, endIndex);

    // Reset to page 1 when items change significantly
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(1);
        }
    }, [currentPage, totalPages]);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedItems,
        startIndex,
        endIndex,
    };
};
