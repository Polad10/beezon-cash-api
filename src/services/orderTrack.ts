import { randomUUID } from 'crypto'
import { OrderTrack, OrderTrackRequest } from '../models/OrderTrack'

export async function recreateOrderTracks(prisma: any, orderTrackRequests: OrderTrackRequest[], orderId: string) {
  await prisma.order_track.deleteMany({
    where: {
      order_id: orderId,
    },
  })

  const orderTracks: OrderTrack[] = orderTrackRequests.map((req) => ({
    id: randomUUID(),
    order_id: orderId,
    delivery_provider: req.delivery_provider,
    track_number: req.track_number,
  }))

  await prisma.order_track.createMany({
    data: orderTracks,
  })
}
