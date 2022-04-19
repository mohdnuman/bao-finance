const Web3 = require("web3");

const baoAbi1 = require("./abi.json");
const baoAbi2 = require("./abi2.json");
const poolAbi = require("./poolAbi.json");
const erc20 = require("./erc20.json");

let web3;

const provider = new Web3.providers.HttpProvider(
  "https://mainnet.infura.io/v3/287af69fca9142f3b1681a93ce4c3afa"
);
web3 = new Web3(provider);

async function getBalance1(address) {
  const baoFinance = "0xBD530a1c060DC600b951f16dc656E4EA451d1A2D";

  const baoInstance = new web3.eth.Contract(baoAbi2, baoFinance);

  const LPLength = await baoInstance.methods.poolLength().call();
  for (let i = 0; i < LPLength; i++) {
    let poolData = await baoInstance.methods.poolInfo(i).call();
    let userData = await baoInstance.methods.userInfo(i, address).call();

    let LPtokensReceived = userData.amount;
    if(LPtokensReceived==0)
    {
        continue;
    }

    let rewards = await baoInstance.methods.pendingReward(i, address).call();

    let LPtoken = poolData.lpToken;

    let LPinstance = new web3.eth.Contract(poolAbi, LPtoken);
    let LPdecimals = await LPinstance.methods.decimals().call();
    let reserves = await LPinstance.methods.getReserves().call();
    let totalSupplyLP = await LPinstance.methods.totalSupply().call();
    totalSupplyLP = totalSupplyLP / 10 ** LPdecimals;
    LPtokensReceived = LPtokensReceived / 10 ** LPdecimals;

    let token0 = await LPinstance.methods.token0().call();
    let token1 = await LPinstance.methods.token1().call();

    let token0instance = new web3.eth.Contract(erc20, token0);
    let token1instance = new web3.eth.Contract(erc20, token1);
    let symbol0 = await token0instance.methods.symbol().call();
    let symbol1 = await token1instance.methods.symbol().call();
    let decimals0 = await token0instance.methods.decimals().call();
    let decimals1 = await token1instance.methods.decimals().call();

    let token0amount = (
      ((LPtokensReceived / totalSupplyLP) * reserves[0]) /
      10 ** decimals0
    ).toFixed(2);
    let token1amount = (
      ((LPtokensReceived / totalSupplyLP) * reserves[1]) /
      10 ** decimals1
    ).toFixed(2);
    if (token0amount != 0 && token1amount != 0) {
      console.log(symbol0, "+", symbol1, token0amount, "+", token1amount);
      console.log("Rewards:", (rewards / 10 ** decimals0).toFixed(2));
    }
  }
}
async function getBalance2(address) {
  const baoFinance = "0x374CB8C27130E2c9E04F44303f3c8351B9De61C1";

  const baoInstance = new web3.eth.Contract(baoAbi1, baoFinance);

  const decimals = await baoInstance.methods.decimals().call();
  const stake = await baoInstance.methods.lockOf(address).call();

  const balance = (stake / 10 ** decimals).toFixed(2);

  console.log("balance:", balance, "BAO");

  const latest = await web3.eth.getBlockNumber();
  const lockedTillBlock = await baoInstance.methods.lockToBlock().call();

  const seconds = (lockedTillBlock - latest) * 13.46025;

  let timeObject = new Date();

  timeObject = new Date(timeObject.getTime() + seconds * 1000);

  console.log("Unlock date:", timeObject);
}

let address = "0xc16414ac1fedfdac4f8a09674d994e1bbb9d7113";
getBalance1(address);
getBalance2(address);
