const mpl = require('@metaplex-foundation/mpl-token-metadata');
const anchor = require('@project-serum/anchor');
const web3 = require('@solana/web3.js');
const bip39 = require('bip39');

function loadWalletKey(keypairFile) {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

const INITIALIZE = true;

async function main(){
    console.log("<<<<<<<< Naming Token on Solana >>>>>>>>");
    console.log("Loading wallet from Mnemonic...");
    const payer = loadWalletKey("wallets/payer.json");
    console.log(`Payer Account: ${payer.publicKey}`);
    const mintAuth = loadWalletKey("wallets/mintAuth.json");
    console.log(`MintAuth Account: ${mintAuth.publicKey}`);
    const freezeAuth = loadWalletKey("wallets/mintAuth.json");
    console.log(`MintAuth Account: ${freezeAuth.publicKey}`);
    console.log("Done Loading wallet from mnemonic.");
    console.log("Initialize token: DbrcZHx94cW1SciQYNybbavkzsom4qE9wmKjF8znvksS...");
    const mint = new web3.PublicKey("DbrcZHx94cW1SciQYNybbavkzsom4qE9wmKjF8znvksS");
    const seed1 = Buffer.from(anchor.utils.bytes.utf8.encode("metadata"));
    const seed2 = Buffer.from(mpl.PROGRAM_ID.toBytes());
    const seed3 = Buffer.from(mint.toBytes());
    const [metadataPDA, _bump] = web3.PublicKey.findProgramAddressSync([seed1, seed2, seed3], mpl.PROGRAM_ID);
    console.log("Done Initilaizing token.")
    const accounts = {
        metadata: metadataPDA,
        mint,
        mintAuthority: mintAuth.publicKey,
        payer: payer.publicKey,
        updateAuthority: mintAuth.publicKey,
    }
    const dataV2 = {
        name: "Trikea Cutie Boi",
        symbol: "TRIKEA",
        uri: "https://raw.githubusercontent.com/nakhimchea/solana_token_metadata/main/metadata.json",
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null
    }
    let ix;
    if (INITIALIZE) {
        const args =  {
            createMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true
            }
        };
        ix = mpl.createCreateMetadataAccountV2Instruction(accounts, args);
    } else {
        const args =  {
            updateMetadataAccountArgsV2: {
                data: dataV2,
                isMutable: true,
                updateAuthority: mintAuth.publicKey,
                primarySaleHappened: true
            }
        };
        ix = mpl.createUpdateMetadataAccountV2Instruction(accounts, args)
    }
    const tx = new web3.Transaction();
    tx.add(ix);
    const connection = new web3.Connection("https://api.devnet.solana.com");
    const txid = await web3.sendAndConfirmTransaction(connection, tx, [payer, mintAuth]);
    console.log(txid);

}

main();