import NonFungibleToken from 0xfb7fb8b56a762069
import ProvenancedTest1 from 0xe601ef1f3ff75421

  transaction {
    let address: Address

    prepare(currentUser: AuthAccount) {

      self.address = currentUser.address
      let account= getAccount(self.address)
      let artCollection = currentUser.getCapability(ProvenancedTest1.CollectionPublicPath).borrow<&{ProvenancedTest1.ProvenancedTest1CollectionPublic}>()

      if artCollection == nil {

        let collection <- ProvenancedTest1.createEmptyCollection()
        currentUser.save(<-collection, to: ProvenancedTest1.CollectionStoragePath)
        currentUser.link<&ProvenancedTest1.Collection{NonFungibleToken.CollectionPublic, ProvenancedTest1.ProvenancedTest1CollectionPublic}>(ProvenancedTest1.CollectionPublicPath, target: ProvenancedTest1.CollectionStoragePath)
        log("account is initialized")
      } else {
        log("account was already initialized")
      }
    }
    post {

      getAccount(self.address).getCapability(ProvenancedTest1.CollectionPublicPath).borrow<&{ProvenancedTest1.ProvenancedTest1CollectionPublic}>() != nil : "Account is not initialized"
      

    }
  }