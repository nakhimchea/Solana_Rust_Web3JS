const { createMint, mintTo, transfer, getAccount, getOrCreateAssociatedTokenAccount } = require('@solana/spl-token');
const { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const loadWalletKey = (keypairFile) => {
  const fs = require("fs");
  const loaded = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())));
  return loaded;
}

(async () => {
  const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

  const payer = loadWalletKey("wallets/YerZE4TTJXBsQQX2vy78zfNeT3DzHfDgvFEHFx6ibN6.json");
  const payee = loadWalletKey("wallets/YeesMYdfSboMmkzyokRowVgp1tvTAxuBbhWGbBdKJ9K.json");
  console.log("Loaded wallets successfully");

  // const payerAirdropTX = await connection.requestAirdrop(payer.publicKey, LAMPORTS_PER_SOL);
  // await connection.confirmTransaction(payerAirdropTX);

  const mintAuthority = payer;
  const freezeAuthority = payer;

  const mint = await createMint(
    connection,
    payer,
    mintAuthority.publicKey,
    freezeAuthority.publicKey,
    0
  );
  console.log("Token Address: ", mint.toBase58());

  // Create a Payer Account to hold Token
  const payerTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );
  console.log("Payer Token Account: ", payerTokenAccount.address.toBase58());
  // Create a Payee Account to hold Token
  const payeeTokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payee.publicKey
  );
  console.log("Payee Token Account: ", payeeTokenAccount.address.toBase58());

  const beforeTokenAccountInfo = await getAccount(connection, payerTokenAccount.address);
  console.log("Before Token Account Balance:", Number(beforeTokenAccountInfo.amount), "Coins");

  // Minting Token to Token Account
  await mintTo(
    connection,
    payer,
    mint,
    payerTokenAccount.address,
    mintAuthority,
    1000000 // because decimals for the mint are set to 0 -> 1M Token
  );

  // Transfering Token to Payee Account
  await transfer(
    connection,
    payer,
    payerTokenAccount.address,
    payeeTokenAccount.address,
    payer.publicKey,
    50000
  );

  const payerTokenAccountInfo = await getAccount(connection, payerTokenAccount.address);
  console.log("Payer Token Account Balance:", Number(payerTokenAccountInfo.amount), "Coins");

  const payeeTokenAccountInfo = await getAccount(connection, payeeTokenAccount.address);
  console.log("Payee Token Account Balance:", Number(payeeTokenAccountInfo.amount), "Coins");
})();