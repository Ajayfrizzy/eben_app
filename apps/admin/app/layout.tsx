import "./globals.css";
export const metadata = {
  title: "Eben Admin",
  description: "Eben Institute administration",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
