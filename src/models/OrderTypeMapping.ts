export interface OrderTypeMapping {
  id: string
  order_id: string
  order_type: OrderType
}

export interface OrderTypeMappingRequest {
  order_type: OrderType
}

export enum OrderType {
  Drugs,
  Electronics,
  Commercial,
}
