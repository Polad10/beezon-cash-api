import tgClient from './tgClient'

export async function getTgId(tgUsername: string) {
  const entity = await tgClient.getEntity(tgUsername)
  return entity.id.valueOf()
}
