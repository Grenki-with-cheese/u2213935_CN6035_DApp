// on-chain property attributes, which are stored as an array of trait_type and value pairs in the tokenURI metadata
export interface PropertyAttribute {
  trait_type: string;
  value: string | number;
}

//property metadata as stored in the database, which is enriched with the on-chain token id and tokenURI when returned by the api
export interface PropertyMetadata {
  name: string;
  address: string;
  description: string;
  image: string;
  id: string;
  attributes: PropertyAttribute[];
}

//what the api returns for a property, which includes the on-chain token id and tokenURI
export interface PropertyDto extends PropertyMetadata {
  onChainId: number;
  tokenURI: string;
}