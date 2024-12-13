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
    where: { name: 'WarehouseRF' },
    update: {},
    create: {
      id: 1,
      name: 'WarehouseRF',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'Courier1' },
    update: {},
    create: {
      id: 2,
      name: 'Courier1',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'Courier2' },
    update: {},
    create: {
      id: 3,
      name: 'Courier2',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'ProcessedInTbilisi' },
    update: {},
    create: {
      id: 4,
      name: 'ProcessedInTbilisi',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'ReadyForDeliveryInTbilisi' },
    update: {},
    create: {
      id: 5,
      name: 'ReadyForDeliveryInTbilisi',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'WarehouseTbilisi' },
    update: {},
    create: {
      id: 6,
      name: 'WarehouseTbilisi',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'ReadyForDeliveryByPony' },
    update: {},
    create: {
      id: 7,
      name: 'ReadyForDeliveryByPony',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'WaitingForDeliveryByPony' },
    update: {},
    create: {
      id: 8,
      name: 'WaitingForDeliveryByPony',
    },
  })

  await prisma.order_status.upsert({
    where: { name: 'Delivered' },
    update: {},
    create: {
      id: 9,
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
