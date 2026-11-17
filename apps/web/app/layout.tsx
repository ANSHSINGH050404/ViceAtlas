import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { NotificationsBell } from "@/components/notifications-bell";
import { DatabuddyProvider } from "@databuddy/sdk/react";

export const metadata: Metadata = {
  title: "ViceAtlas — GTA VI Discovery Network",
  description: "A community-powered database of discoveries, mysteries and hidden places.",
  metadataBase: new URL(process.env.BETTER_AUTH_URL || "http://localhost:3000")
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() }).catch(() => null);
  const user = session ? { id: session.user.id, traits: { email: session.user.email, name: session.user.name } } : null;

  return (
    <html lang="en">
      <body>
        {children}
        <NotificationsBell />
        <DatabuddyProvider
          clientId={process.env.NEXT_PUBLIC_DATABUDDY_CLIENT_ID || ""}
          autocapture={{ webVitals: true, errors: true, interactions: true, outgoingLinks: true }}
          replay
          skipPaths={["/admin/**"]}
          user={user}
        />
      </body>
    </html>
  );
}