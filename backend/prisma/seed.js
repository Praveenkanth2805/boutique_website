const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Create admin user if not exists
  const adminEmail = 'praveenkanth2805@gmail.com';
  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('praveenkaviya2811', 10);
    await prisma.admin.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        otpVerified: true,
      },
    });
    console.log('Admin created: admin@example.com / admin123');
  }

  // Optional: create a demo service
  // const serviceCount = await prisma.service.count();
  // if (serviceCount === 0) {
  //   const service = await prisma.service.create({
  //     data: {
  //       name: 'Bridal Lehenga',
  //       description: 'Exquisite hand-embroidered bridal lehenga in red and gold.',
  //       price: 49999,
  //     },
  //   });
  //   console.log('Demo service created');
  // }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());