import { Inter } from "next/font/google";
import ClientLayout from "@/components/ClientLayout/ClientLayout";
import "react-international-phone/style.css";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
});

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Prevent theme flicker on first paint */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function () {
  try {
    const theme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {}
})();`,
                    }}
                />
            </head>

            <body className={inter.className}>
                <ClientLayout>{children}</ClientLayout>
            </body>
        </html>
    );
}
