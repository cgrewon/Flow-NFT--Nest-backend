import NonFungibleToken from 0xfb7fb8b56a762069
import ProvenancedTest1 from 0xe601ef1f3ff75421

transaction(recipient: Address,name: String,ipfsLink: String) {
    let minter: &ProvenancedTest1.NFTMinter
    let receiver: &AnyResource{NonFungibleToken.CollectionPublic}

    prepare(signer: AuthAccount) {

        let recipientAcc = getAccount(recipient)

        self.receiver = recipientAcc
            .getCapability(ProvenancedTest1.CollectionPublicPath)!
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        self.minter = signer.borrow<&ProvenancedTest1.NFTMinter>(from: ProvenancedTest1.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
        

    }

    execute {
        // let recipient = getAccount(recipient)

        // let receiver = recipient
        //     .getCapability(ProvenancedTest1.CollectionPublicPath)!
        //     .borrow<&{NonFungibleToken.CollectionPublic}>()
        //     ?? panic("Could not get receiver reference to the NFT Collection")

        self.minter.mintNFT(recipient: self.receiver, name: name,ipfsLink:ipfsLink)
        
        log("NFT Minted and deposited to ".concat(recipient.toString()))

    }
}