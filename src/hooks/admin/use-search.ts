import { useMemo, useState } from "react";

export const useSearch = <T>(
    items: T[],
    searchFn: (item: T, searchTerm: string) => boolean
) => {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredItems = useMemo(() => {
        if (!searchTerm.trim()) return items;
        return items.filter((item) => searchFn(item, searchTerm.toLowerCase()));
    }, [items, searchTerm, searchFn]);

    return {
        searchTerm,
        setSearchTerm,
        filteredItems,
    };
};
