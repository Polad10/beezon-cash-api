export interface OrderTrack {
	id: string
	order_id: string
	delivery_provider: DeliveryProvider
	track_number?: string
}

export interface OrderTrackRequest {
	delivery_provider: DeliveryProvider
	track_number?: string
}

export enum DeliveryProvider {
	Ozon,
	Wildberries,
	CDEK,
	PostRussia,
	Boxberry,
	POST5,
	DPD,
	Cold,
	AptekaRu,
	Lamoda,
	YandexMarket,
}
