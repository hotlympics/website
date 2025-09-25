import { UploadedPhoto } from "../hooks/profile/use-photo-upload";

import photo1 from "../assets/demo/photo1.webp";
import photo2 from "../assets/demo/photo2.jpg";
import photo3 from "../assets/demo/photo3.jpg";
import photo4 from "../assets/demo/photo4.webp";
import photo5 from "../assets/demo/photo5.jpg";

// Demo photos with realistic ELO ratings and performance data
export const DEMO_PHOTOS: UploadedPhoto[] = [
    {
        id: "demo-1",
        url: photo1,
        battles: 156,
        wins: 144,
        losses: 12,
        draws: 0,
        glicko: {
            rating: 2425,
            rd: 50,
            volatility: 0.04,
            mu: 4.85,
            phi: 0.15,
            lastUpdateAt: new Date("2024-01-15"),
            systemVersion: 1,
        },
        inPool: true,
        status: "active" as const,
        gender: "male" as const,
        dateOfBirth: new Date("1995-06-15"),
        createdAt: new Date("2024-01-10"),
        uploadedAt: new Date("2024-01-10"),
        randomSeed: 0.742,
    },
    {
        id: "demo-2",
        url: photo2,
        battles: 152,
        wins: 139,
        losses: 13,
        draws: 0,
        glicko: {
            rating: 2380,
            rd: 52,
            volatility: 0.045,
            mu: 4.78,
            phi: 0.16,
            lastUpdateAt: new Date("2024-01-14"),
            systemVersion: 1,
        },
        inPool: false,
        status: "active" as const,
        gender: "male" as const,
        dateOfBirth: new Date("1995-06-15"),
        createdAt: new Date("2024-01-08"),
        uploadedAt: new Date("2024-01-08"),
        randomSeed: 0.156,
    },
    {
        id: "demo-3",
        url: photo3,
        battles: 141,
        wins: 120,
        losses: 21,
        draws: 0,
        glicko: {
            rating: 2111,
            rd: 65,
            volatility: 0.055,
            mu: 4.21,
            phi: 0.19,
            lastUpdateAt: new Date("2024-01-16"),
            systemVersion: 1,
        },
        inPool: true,
        status: "active" as const,
        gender: "male" as const,
        dateOfBirth: new Date("1995-06-15"),
        createdAt: new Date("2024-01-05"),
        uploadedAt: new Date("2024-01-05"),
        randomSeed: 0.891,
    },
    {
        id: "demo-4",
        url: photo4,
        battles: 154,
        wins: 151,
        losses: 3,
        draws: 0,
        glicko: {
            rating: 2490,
            rd: 45,
            volatility: 0.035,
            mu: 4.95,
            phi: 0.13,
            lastUpdateAt: new Date("2024-01-13"),
            systemVersion: 1,
        },
        inPool: false,
        status: "active" as const,
        gender: "male" as const,
        dateOfBirth: new Date("1995-06-15"),
        createdAt: new Date("2024-01-12"),
        uploadedAt: new Date("2024-01-12"),
        randomSeed: 0.334,
    },
    {
        id: "demo-5",
        url: photo5,
        battles: 142,
        wins: 124,
        losses: 18,
        draws: 0,
        glicko: {
            rating: 2140,
            rd: 60,
            volatility: 0.05,
            mu: 4.28,
            phi: 0.17,
            lastUpdateAt: new Date("2024-01-15"),
            systemVersion: 1,
        },
        inPool: false,
        status: "active" as const,
        gender: "male" as const,
        dateOfBirth: new Date("1995-06-15"),
        createdAt: new Date("2024-01-07"),
        uploadedAt: new Date("2024-01-07"),
        randomSeed: 0.667,
    },
];

// Demo user profile matching PoolSelection UserInfo interface
export const DEMO_USER = {
    email: "demo@hotlympics.com",
    gender: "male" as const,
    dateOfBirth: "1995-06-15",
    poolImageIds: ["demo-1", "demo-3"], // 2 photos in pool
};

// Demo pool selections (Set of photo IDs that are in the pool)
export const DEMO_POOL_SELECTIONS = new Set<string>(["demo-1", "demo-3"]);
