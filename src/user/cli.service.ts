const { exec } = require('child_process');

let isMinting: boolean = false;



export function getAccountNFTs(
  address: string,
): Promise<[] | null | string | undefined> {
  console.log('getAccountNFTs address : ', address);

  return new Promise((resolve, reject) => {
    exec(
      `flow scripts execute ./cli/scripts/get_account_info.cdc --arg Address:"${address}" --network=testnet`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(error);
          return;
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(stderr);
          return;
        }
        console.log(`stdout: ${stdout}`);

        const parts = stdout.split('Result: ');
        if (parts.length >= 2) {
          const res = parts[1];
          console.warn('res: ', res);
          const items = res
            .substring(1, res.length - 2)
            .split(`A.${address}.ProvenancedTest1.NftData`);
          const validItems = items.filter((item) => item.trim() != '');
          let nfts = validItems.map((item) => {
            const parts = item.split('id: ');
            let id = '';
            if (parts.length >= 2){
              let idStr = parts[1];
              const numbers = "1234567890";
              
              for (let _char of idStr) {
                if (numbers.includes(_char)) {
                  id += _char;
                }
              }
            }

            let idNum: number = id == '' ? -1 : parseInt(id);
            return {id: idNum , data:`A.${address}.ProvenancedTest1.NftData` + item.trim()};
          });

          nfts = nfts.sort((a,b)=>a.id < b.id ? -1 : 1);
          resolve(nfts);
        }

        resolve(null);
      },
    );
  });
}

export function getLastNFT(address: string): Promise<any | null>{

  return new Promise(async(resolve, reject)=>{
    try{
      const nfts = await getAccountNFTs(address);
      if (nfts && nfts.length > 0) {
        resolve(nfts[nfts.length - 1]);
      }

      resolve(null);
    }catch(ex){
      reject(ex);
    }
  });
}

export async function mintNft(
  cidMetadataLink: string,
): Promise<any | undefined | null> {
  if (isMinting) {
    return null;
  }
  if (!cidMetadataLink) {
    return undefined;
  }
  isMinting = true;
  console.log('MINTER1', process.env.MINTER_ADDRESS);
  return new Promise(async (resolve, reject) => {
    try {
      const buildRes = await buildMintTrx(cidMetadataLink);
      console.log('buildRes : ', buildRes);

      const signedRes = await signMintTrx();
      console.log('signedRes : ', signedRes);

      const sendRes = await sendSignedTrx();
      console.log('sendRes : ', sendRes);

      // isMinting = false;
      
      const lastNft = await getLastNFT(process.env.MINTER_ADDRESS);
      resolve(lastNft);
    } catch (ex) {
      isMinting = false;
      console.error(ex);
      reject(ex);
    }
  });
}


export async function transferNft(
  receiptAddr: string,
  nftId: number
): Promise<number | undefined | null> {
  // if (isMinting) {
  //   return null;
  // }
  if (!receiptAddr) {
    return undefined;
  }

  isMinting = true;
  console.log('MINTER1', process.env.MINTER_ADDRESS);
  return new Promise(async (resolve, reject) => {
    try {
      const buildRes = await buildTransferTrx(receiptAddr, nftId);
      console.log('buildRes : ', buildRes);

      const signedRes = await signMintTrx();
      console.log('signedRes : ', signedRes);

      const sendRes = await sendSignedTrx();
      console.log('sendRes : ', sendRes);

      isMinting = false;
            
      resolve(nftId);
    } catch (ex) {
      isMinting = false;
      console.error(ex);
      reject(ex);
    }
  });
}


export function buildMintTrx(cidMetadataLink: string): Promise<string> {
  //** cidMetadataLink :  "bafyreigb7qezbgh7z5dv6yogltx4kovufnmpuqjj4v377mh3u4bknv25ei/metadata.json"

  return new Promise((resolve, reject) => {
    const cmd = `flow transactions build ./cli/transactions/mint_nft.cdc "0xe601ef1f3ff75421" "ProvenancedTest1" "${cidMetadataLink}" \
    --authorizer ProvenancedTest1 \
    --proposer ProvenancedTest1 \
    --payer ProvenancedTest1 \
    --filter payload \
    --save transactions.build.rlp \
    --network testnet`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      } else if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}

export function signMintTrx(): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `flow transactions sign ./transactions.build.rlp \
    --signer ProvenancedTest1 \
    --filter payload \
    --save transactions.signed.rlp \
    -y \
    --network testnet`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }

      resolve(stdout);
    });
  });
}

export function sendSignedTrx(): Promise<string> {
  return new Promise((resolve, reject) => {
    const cmd = `flow transactions send-signed ./transactions.signed.rlp --network testnet`;
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}


export function buildTransferTrx(address: string, nftId: number): Promise<string> {
 
  return new Promise((resolve, reject) => {
    const cmd = `flow transactions build ./cli/transactions/transfer_nft.cdc "${address}"  ${nftId} \
    --authorizer ProvenancedTest1 \
    --proposer ProvenancedTest1 \
    --payer ProvenancedTest1 \
    --filter payload \
    --save transactions.build.rlp \
    --network testnet`;

    console.log('cmd', cmd);

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      } else if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
}
