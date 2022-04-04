const Web3 = require("web3");

const baoAbi = require("./abi.json");


const readline = require("readline-sync");

let web3;

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/287af69fca9142f3b1681a93ce4c3afa"
);
web3 = new Web3(provider);

const baoFinance="0x374CB8C27130E2c9E04F44303f3c8351B9De61C1";


const baoInstance = new web3.eth.Contract(
  baoAbi,
  baoFinance
);


async function getBalance() {
  let address = readline.question("enter address:");
  console.log("BAO staking:");

  const decimals=await baoInstance.methods.decimals().call();
  const stake= await baoInstance.methods.lockOf(address).call();

  const balance=(stake/(10**decimals)).toFixed(2)

  console.log('balance:',balance,'BAO');

  const latest = await web3.eth.getBlockNumber();
  const lockedTillBlock=await baoInstance.methods.lockToBlock().call();

  const seconds=(lockedTillBlock-latest)*13.46025;

  let timeObject = new Date();

  timeObject = new Date(timeObject.getTime() + seconds*1000);

  console.log('Unlock date:',timeObject);
}

getBalance();

