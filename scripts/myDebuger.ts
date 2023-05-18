import { OnChainCalls, Transaction } from "../submodules/library-sui/src";
import { readFile, requestGas } from "../submodules/library-sui/src/utils";
import { Networks } from "../src/constants";
import { RawSigner } from "@mysten/sui.js";
import { toBigNumberStr, toBigNumber } from "@firefly-exchange/library";
import { BluefinClient } from "../src/bluefinClient";

async function mintUSDC(signer: RawSigner, contractCalls: OnChainCalls) {
  const currCoins = await contractCalls.getUSDCCoins({
    address: await signer.getAddress(),
  });
  let coins = { data: [] };
  console.log("GOING TO MINT: currCoins:", currCoins.data.length);
  while (coins.data.length <= currCoins.data.length) {
    const tx = await contractCalls.mintUSDC({
      amount: toBigNumberStr(10000, 6),
      to: await signer.getAddress(),
    });
    coins = await contractCalls.getUSDCCoins({
      address: await signer.getAddress(),
    });
    // console.log("coins:", coins.data);
  }
}

async function DepositToBank(signer: RawSigner, contractCalls: OnChainCalls) {
  const coins = await contractCalls.getUSDCCoins({
    address: await signer.getAddress(),
  });
  let coin = 0;
  for (let i in coins.data) {
    if (coins.data[i].balance > 0) {
      coin = coins.data[i];
      break;
    }
    // console.log("coin:", coins.data[i].balance);
  }

  const depositReceipt = await contractCalls.depositToBank(
    {
      coinID: (coin as any).coinObjectId,
      amount: toBigNumberStr("10000", 6),
    },
    signer
  );
  // console.log("depositReceipt:", depositReceipt);
  const usdcBalance = await contractCalls.getUSDCBalance(
    {
      address: await signer.getAddress(),
    },
    signer
  );
  return usdcBalance;
}

async function initAccount(client:BluefinClient, deployment:any, scheme:any){
  const contractCalls = new OnChainCalls(client.getSignerWithProvider(), deployment);
  await requestGas(
    await client.getSigner().getAddress(),
    Networks.LOCAL_SUI.faucet
  );
  await mintUSDC(client.getSigner(), contractCalls);
  console.log(await DepositToBank(client.getSigner(), contractCalls));
  return contractCalls;
}

async function getCoins(client:BluefinClient, contractCalls1:OnChainCalls){
  const coins = await contractCalls1.getUSDCCoins({
    address: await client.getSigner().getAddress(),
  },
  client.getSigner());
  return coins;
}

async function main() {
  let accounts = {
    account1:{
      seed: "explain august dream guitar mail attend enough demise engine pulse wide later",
      client: new BluefinClient(true, Networks.LOCAL_SUI),
      scheme:'Secp256k1'
    },
    account2:{
      seed: "disorder hero edge ancient champion velvet pact bright differ brick slogan trust",
      client: new BluefinClient(true, Networks.LOCAL_SUI),
      scheme:'Secp256k1'
    }
  }
  accounts.account1.client.initializeWithSeed(accounts.account1.seed,accounts.account1.scheme);
  accounts.account2.client.initializeWithSeed(accounts.account2.seed,accounts.account2.scheme);
  const deployment = readFile("./newDeployment.json");
  const contractCalls1 = await initAccount(accounts.account1.client, deployment, accounts.account1.scheme);
  const contractCalls2 = await initAccount(accounts.account2.client, deployment, accounts.account2.scheme);
  const coins = await getCoins(accounts.account1.client, contractCalls1);
  // console.log("coins:", coins.data);
  const coins2 = await getCoins(accounts.account2.client, contractCalls2);
  // console.log("coins2:", coins2.data);

  
  
}

main().then().catch();
