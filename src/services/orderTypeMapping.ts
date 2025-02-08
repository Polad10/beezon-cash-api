import { randomUUID } from 'crypto'
import { OrderTypeMapping, OrderTypeMappingRequest } from '../models/OrderTypeMapping'

export async function recreateOrderTypeMappings(
  prisma: any,
  orderTypeMappingRequests: OrderTypeMappingRequest[],
  orderId: string
) {
  await prisma.order_type_mapping.deleteMany({
    where: {
      order_id: orderId,
    },
  })

  const orderTypeMappings: OrderTypeMapping[] = orderTypeMappingRequests.map((req) => ({
    id: randomUUID(),
    order_id: orderId,
    order_type: req.order_type,
  }))

  await prisma.order_type_mapping.createMany({
    data: orderTypeMappings,
  })
}
