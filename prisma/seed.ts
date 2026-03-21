import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const accounts = [
    { name: "主账户" },
    { name: "储蓄账户" },
    { name: "信用卡" },
    { name: "支付宝" },
    { name: "微信" },
  ]

  for (const account of accounts) {
    const existing = await prisma.account.findFirst({
      where: { name: account.name },
    })
    if (!existing) {
      await prisma.account.create({ data: account })
      console.log(`创建账户: ${account.name}`)
    } else {
      console.log(`账户已存在: ${account.name}`)
    }
  }

  console.log("种子数据已创建")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
