import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const rootUser = await prisma.user.upsert({
    where: { email: 'manager@transitops.com' },
    update: {},
    create: {
      email: 'manager@transitops.com',
      name: 'John Fleet Manager',
      password: hashedPassword,
      role: 'Fleet_Manager'
    }
  });

  console.log('🚀 Supabase Root Admin Seeded Successfully:', rootUser.email);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });