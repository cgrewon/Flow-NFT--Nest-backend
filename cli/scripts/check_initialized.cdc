import NonFungibleToken from 0xfb7fb8b56a762069
import ProvenancedTest1 from 0xe601ef1f3ff75421


pub fun main(address:Address) : Bool {
    let account = getAccount(address)
    let res = ProvenancedTest1.checkInitialized(address: address)
    return res
}