export function getFinalPrice(order: any) {
	return order.current_price.add(order.partner_cost).add(order.additional_cost)
}
