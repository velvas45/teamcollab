import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
}));

// Mock next/image
// vi.mock("next/image", () => ({
//   default: vi
//     .fn()
//     .mockImplementation(({ src, alt }) => (
//       <img src={src || "/placeholder.svg"} alt={alt} />
//     )),
// }));

// Mock environment variables
process.env.NEXT_PUBLIC_SOCKET_URL = "ws://localhost:3001";
