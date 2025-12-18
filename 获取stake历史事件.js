const Web3 = require('web3');
const fs = require('fs');

const RPC_URL = 'https://bsc-mainnet.infura.io/v3/c316443929bb41a6b5ee8223089fbe8e';

const web3 = new Web3(RPC_URL);

const CONTRACT = '0x3273a291ff46ab09804ea7959c85b75f431e0aae';
const EVENT_TOPIC = web3.utils.keccak256(
  'Staked(address,uint256,uint256,uint256,uint256)'
);
//解析staked数据：web3.eth.abi.decodeParameters(['address','uint256','uint256','uint256','uint256'])
// ⚠️ 修改为合约真实部署区块（非常重要）
const START_BLOCK = 43883941;
const END_BLOCK = 'latest';

// 每次扫描的区块数量（BSC 推荐 2000～5000）
const STEP = 3000;

async function getLatestBlock() {
  return await web3.eth.getBlockNumber();
}

async function scan() {
  const latest = END_BLOCK === 'latest'
    ? await getLatestBlock()
    : END_BLOCK;

  //let fromBlock = START_BLOCK;
  let fromBlock = latest - 100000;
  let allLogs = [];
  let counter = 0;
  while (fromBlock <= latest) {
    const toBlock = Math.min(fromBlock + STEP - 1, latest);

    console.log(`⛏ scanning blocks ${fromBlock} -> ${toBlock}`);

    try {
      const logs = await web3.eth.getPastLogs({
        fromBlock,
        toBlock,
        address: CONTRACT,
        topics: [EVENT_TOPIC],
      });

      console.log(`✅ found ${logs.length} logs`);
      allLogs.push(...logs);

      // 及时写入文件，防止内存爆
      
      /*
      fs.appendFileSync(
        'staked_logs.json',
        logs.map(l => JSON.stringify(l)).join('\n') + '\n'
      );
      
      */

    } catch (err) {
      console.error('❌ error:', err.message);
      console.log('⏳ retrying...');
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

	console.log('🎉 counter',counter);
	counter ++;
	if(counter > 20)
	
		break;
		
    fromBlock = toBlock + 1;
    await new Promise(r => setTimeout(r, 500)); // 防止 RPC 限流
  }

  console.log('🎉 finished',allLogs);
  
}

scan();
