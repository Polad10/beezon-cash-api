import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await fillCityTable()
  await fillDeliveryProviderTable()
  await fillOrderStatusTable()
  await fillOrderTypeTable()
}

async function fillCityTable() {
  await prisma.city.upsert({
    where: { name: 'Other' },
    update: {},
    create: {
      id: 0,
      name: 'Other',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Tbilisi' },
    update: {},
    create: {
      id: 1,
      name: 'Tbilisi',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Batumi' },
    update: {},
    create: {
      id: 2,
      name: 'Batumi',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Borjomi' },
    update: {},
    create: {
      id: 3,
      name: 'Borjomi',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Rustavi' },
    update: {},
    create: {
      id: 4,
      name: 'Rustavi',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Mtskheta' },
    update: {},
    create: {
      id: 5,
      name: 'Mtskheta',
    },
  })

  await prisma.city.upsert({
    where: { name: 'Kobuleti' },
    update: {},
    create: {
      id: 6,
      name: 'Kobuleti',
    },
  })
}

async function fillDeliveryProviderTable() {
  await prisma.delivery_provider.upsert({
    where: { name: 'Ozon' },
    update: {},
    create: {
      id: 0,
      name: 'Ozon',
    },
  })

  await prisma.delivery_provider.upsert({
    where: { name: 'Wildberries' },
    update: {},
    create: {
      id: 1,
      name: 'Wildberries',
    },
  })

  await prisma.delivery_provider.upsert({
    where: { name: 'CDEK' },
    update: {},
    create: {
      id: 2,
      name: 'CDEK',
    },
  })

  await prisma.delivery_provider.upsert({
    where: { name: 'PostRussia' },
    update: {},
    create: {
      id: 3,
      name: 'PostRussia',
    },
  })

  await prisma.delivery_provider.upsert({
    where: { name: 'Boxberry' },
    update: {},
    create: {
      id: 4,
      name: 'Boxberry',
    },
  })

  await prisma.delivery_provider.upsert({
    where: { name: 'POST5' },
    update: {},
    create: {
      id: 5,
      name: 'POST5',
    },
  })
}

async function fillOrderStatusTable() {
  await prisma.order_status.upsert({
    where: { name: 'New' },
    update: {},
    create: {
      id: 0,
      name: 'New',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'OnTheWay' },
    update: {},
    create: {
      id: 1,
      name: 'OnTheWay',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'ArrivedInDestinationCountry' },
    update: {},
    create: {
      id: 2,
      name: 'ArrivedInDestinationCountry',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'WaitingForPayment' },
    update: {},
    create: {
      id: 3,
      name: 'WaitingForPayment',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'Delivered' },
    update: {},
    create: {
      id: 4,
      name: 'Delivered',
    },
  })
}

async function fillOrderTypeTable() {
  await prisma.order_type.upsert({
    where: { name: 'Drugs' },
    update: {},
    create: {
      id: 0,
      name: 'Drugs',
    },
  })

  await prisma.order_type.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: {
      id: 1,
      name: 'Electronics',
    },
  })

  await prisma.order_type.upsert({
    where: { name: 'Commercial' },
    update: {},
    create: {
      id: 2,
      name: 'Commercial',
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
