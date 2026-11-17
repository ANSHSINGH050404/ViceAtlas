import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "explorer@viceatlas.local";
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Atlas Explorer", email, emailVerified: true, username: "atlas-explorer" }
  });

  const samples = [
    {
      slug: "coastal-observation-point-demo",
      title: "Coastal observation point (demo entry)",
      description: "This is placeholder content to demonstrate the discovery feed and detail page. Replace it with a real, reproducible community discovery after launch.",
      category: "LOCATION" as const,
      status: "PENDING" as const,
      latitude: 25.77,
      longitude: -80.19,
      region: "Demo region"
    },
    {
      slug: "unexplained-night-lights-demo",
      title: "Unexplained night lights (demo entry)",
      description: "Placeholder mystery entry. This is not a claim about the released game. Use the submission workflow to publish discoveries supported by your own evidence.",
      category: "MYSTERY" as const,
      status: "PENDING" as const,
      region: "Demo region"
    }
  ];

  for (const item of samples) {
    await prisma.discovery.upsert({
      where: { slug: item.slug },
      update: {},
      create: { ...item, authorId: user.id }
    });
  }
}

main().finally(() => prisma.$disconnect());
