import collectionData from "./collection.json"

export interface CollectionItem {
  id: number
  title: string
  img: string
  mobileImg?: string
  tabletImg?: string
}

const collection: CollectionItem[] = collectionData as CollectionItem[]

export default collection
