import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"
import "dotenv/config"

const prisma = new PrismaClient()

async function main() {
  // 从环境变量读取管理员用户信息
  const defaultEmail = process.env.ADMIN_USER;
  const defaultPassword = process.env.ADMIN_PASSWORD;

  let user = await prisma.user.findUnique({
    where: { email: defaultEmail }
  })

  if (!defaultEmail || !defaultPassword) {
    console.error("未配置默认用户信息")
    process.exit(1)
  }

  if (!user) {
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)
    user = await prisma.user.create({
      data: {
        email: defaultEmail,
        password: hashedPassword,
        name: "管理员"
      }
    })
    console.log(`创建默认用户: ${defaultEmail}`)
  } else {

    console.log(`默认用户已存在: ${defaultEmail}`)
  }



  // 创建账户
  const accounts = [
    { name: "支付宝" },
    { name: "微信" },
  ]

  for (const account of accounts) {
    const existing = await prisma.account.findFirst({
      where: {
        name: account.name,
        userId: user?.id
      },
    })
    if (!existing) {
      await prisma.account.create({
        data: {
          ...account,
          userId: user.id
        }
      })
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
