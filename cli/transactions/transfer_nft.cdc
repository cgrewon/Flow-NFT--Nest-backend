import NonFungibleToken from 0xfb7fb8b56a762069
import ProvenancedTest1 from 0xe601ef1f3ff75421

transaction(recipient: Address,id: UInt64) {
    // let minter: &ProvenancedTest1.NFTMinter
    let transferToken: @NonFungibleToken.NFT
	
    prepare(signer: AuthAccount) {

        // Borrow a reference from the stored collection
        let collectionRef = signer.borrow<&ProvenancedTest1.Collection>(from: ProvenancedTest1.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        // Call the withdraw function on the sender's Collection
        // to move the NFT out of the collection
        self.transferToken <- collectionRef.withdraw(withdrawID: id)
    }

    execute {
        // Get the recipient's public account object
        let recipient = getAccount(recipient)

        // Get the Collection reference for the receiver
        // getting the public capability and borrowing a reference from it
        // let receiverRef = recipient.getCapability<&{NonFungibleToken.Receiver}>(/public/NFTReceiver)
        //     .borrow()
        //     ?? panic("Could not borrow receiver reference")


        let receiverRef = recipient
            .getCapability(ProvenancedTest1.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        // Deposit the NFT in the receivers collection
        receiverRef.deposit(token: <-self.transferToken)

        log("NFT ID 1 transferred from account 2 to account 1")
    }

}