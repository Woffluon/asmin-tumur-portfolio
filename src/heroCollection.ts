import heroData from "./heroCollection.json"

export interface HeroCollectionItem {
  id: string
  slot: string
  title: string
  category: string
  img: string
  mobileImg?: string
  tabletImg?: string
}

const heroCollection: HeroCollectionItem[] = heroData as HeroCollectionItem[]

export default heroCollection
