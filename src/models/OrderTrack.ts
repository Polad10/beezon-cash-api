export interface OrderTrack {
  id: string
  order_id: string
  delivery_provider: DeliveryProvider
  track_number: string
}

export interface OrderTrackRequest {
  delivery_provider: DeliveryProvider
  track_number: string
}

export enum DeliveryProvider {
  CDEK,
  Post,
  Boxberry,
  POST5,
}
