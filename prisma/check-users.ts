import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const users = await prisma.user.findMany()
  console.log('Users in database:', users)
  
  if (users.length > 0) {
    console.log('\nFirst user ID:', users[0].id)
    console.log('First user email:', users[0].email)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })