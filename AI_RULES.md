# AI Development Rules for SIGLA Application

This document outlines the technical stack and specific library usage rules to ensure consistency, maintainability, and best practices in the SIGLA application development.

## Tech Stack Overview

*   **Framework**: Next.js (React framework for server-side rendering, routing, and API routes)
*   **Language**: TypeScript (for type safety and improved developer experience)
*   **Styling**: Tailwind CSS (utility-first CSS framework for rapid UI development)
*   **UI Components**: shadcn/ui (reusable UI components built on Radix UI and styled with Tailwind CSS)
*   **Database ORM**: Prisma (Next-generation ORM for Node.js and TypeScript, used with MySQL)
*   **Database**: MySQL (relational database for data storage)
*   **Authentication**: JSON Web Tokens (JWT) for session management, `bcryptjs` for secure password hashing.
*   **Icons**: Lucide React (a collection of beautiful and customizable SVG icons)
*   **Client-side Utilities**: `js-cookie` for cookie management, custom hooks for common functionalities like geotagging.
*   **Carousel**: Embla Carousel (for responsive and touch-friendly carousels)

## Library Usage Rules

To maintain a consistent and efficient codebase, please adhere to the following rules when using libraries:

*   **UI Components**:
    *   **Always** use components from `@/components/ui/` (shadcn/ui) for all UI elements (e.g., `Button`, `Card`, `Dialog`, `Table`, `Input`, `Select`, `Switch`).
    *   **Do NOT** modify the core shadcn/ui component files directly. If a component needs significant customization beyond what props allow, create a new component that wraps or extends the shadcn/ui component, or build a new component from scratch following Tailwind CSS and accessibility best practices.
*   **Styling**:
    *   **Exclusively** use Tailwind CSS classes for all styling. Avoid inline styles unless absolutely necessary for dynamic values (e.g., `style={{ width: '...' }}`).
    *   Ensure designs are responsive by utilizing Tailwind's responsive utility classes (e.g., `md:`, `lg:`).
*   **Icons**:
    *   **Always** use icons from the `lucide-react` library.
*   **Database Interactions**:
    *   **Always** use Prisma Client (`@prisma/client`) for all database queries and mutations.
    *   API routes should interact with the database via Prisma.
*   **Authentication**:
    *   For password hashing, use `bcryptjs`.
    *   For JWT generation and verification, use `jsonwebtoken`.
    *   For client-side cookie management (e.g., `sigla_token`), use `js-cookie`.
*   **Routing**:
    *   Use Next.js's built-in routing (`next/navigation` for hooks like `useRouter`, `useSearchParams`, and `next/link` for navigation).
*   **State Management**:
    *   Prioritize React's built-in state management (`useState`, `useEffect`, `useCallback`, `useRef`, `useContext`). Avoid introducing external state management libraries (e.g., Redux, Zustand) unless a clear and significant need arises that cannot be met by React's native capabilities.
*   **Carousel**:
    *   Use `embla-carousel-react` and `embla-carousel-autoplay` for any carousel functionalities, as demonstrated in `ImageCarousel.tsx`.
*   **Geotagging**:
    *   Utilize the existing `geotaggingService` and `useGeotagging` hook from `src/app/survey/forms/utils/geotagging.ts` and `src/app/survey/forms/utils/useGeotagging.ts` for all location-based functionalities.
    *   Leaflet.js should be dynamically loaded as shown in `interactive-map.tsx` for map rendering.
*   **File Structure**:
    *   Keep source code within the `src` folder.
    *   Place pages in `src/app/` (Next.js App Router convention).
    *   Place reusable components in `src/components/`.
    *   Place utility functions and hooks in `src/lib/utils.ts` or dedicated `utils/` folders within relevant feature directories (e.g., `src/app/survey/forms/utils/`).
    *   Directory names **MUST** be all lower-case. File names may use mixed-case (PascalCase for components, camelCase for utilities).