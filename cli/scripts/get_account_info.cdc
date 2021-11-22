import NonFungibleToken from 0xfb7fb8b56a762069
import ProvenancedTest1 from 0xe601ef1f3ff75421


pub fun main(address:Address) : [ProvenancedTest1.NftData] {
    let account = getAccount(address)
    let nft = ProvenancedTest1.getNft(address: address)
    return nft
}