/*
 * Terms of Service Configuration
 *
 * To bump the Terms of Service (TOS) version:
 *
 * 1. Add a new TOS markdown version entry to the public/legal/ directory
 * 2. Update the CURRENT_TOS_VERSION constant to the new version
 * 3. Add the new version to the TOS_VERSIONS object with its effective date
 *
 */

export const CURRENT_TOS_VERSION = "1.0";

export const TOS_VERSIONS: Record<
    string,
    { file: string; effectiveDate: string }
> = {
    "1.0": {
        file: "/legal/tos-v1.0.md",
        effectiveDate: "09.08.2025", // dd.mm.yyyy
    },
};

export const getCurrentTosFile = () => {
    return TOS_VERSIONS[CURRENT_TOS_VERSION]?.file || "/legal/tos-v1.0.md";
};
