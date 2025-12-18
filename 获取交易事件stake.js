function getStake(){

	/* ==========  配置区  ========== */
	const BSC_WS      = 'wss://bsc-mainnet.infura.io/ws/v3/c316443929bb41a6b5ee8223089fbe8e';   // 币安官方 WS 之一
	const STAKING_ADDR = '0x3273a291ff46ab09804ea7959c85b75f431e0aae';  // 你的质押合约地址
	const STAKED_ABI   = [
	  {
	    "anonymous": false,
	    "inputs": [
	      { "indexed": true,  "internalType": "address", "name": "user",      "type": "address" },
	      { "indexed": false, "internalType": "uint256", "name": "amount",    "type": "uint256" },
	      { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
	      { "indexed": false, "internalType": "uint256", "name": "index",     "type": "uint256" },
	      { "indexed": false, "internalType": "uint256", "name": "stakeTime", "type": "uint256" }
	    ],
	    "name": "Staked",
	    "type": "event"
	  }
	];
	/* ================================= */
	

	const web3 = new Web3(BSC_WS);
	
	const contract = new web3.eth.Contract(STAKED_ABI, STAKING_ADDR);
	
	// 1. 实时监听
/*
	contract.events.Staked({ fromBlock: 'latest' })
	  .on('data', log => {
	    console.log('--- New Staked ---');
	    console.log('tx       :', log.transactionHash);
	    console.log('user     :', log.returnValues.user);
	    console.log('amount   :', web3.utils.fromWei(log.returnValues.amount));
	    console.log('timestamp:', new Date(Number(log.returnValues.timestamp) * 1000).toISOString());
	    console.log('index    :', log.returnValues.index);
	    console.log('stakeTime:', Number(log.returnValues.stakeTime));
	  })
	  .on('error', console.error);
	  
*/
	
	// 2. 如需扫历史块，取消注释
	
	async function history() {
	  const current = await web3.eth.getBlockNumber();
	  const logs = await contract.getPastEvents('Staked', {
	    //fromBlock: current - 5000,
	    fromBlock: 0,
	    toBlock:   current
	  });
	  //logs.forEach((l,index) => {console.log(index, l.returnValues)});
	  logs.forEach((l,index) => {console.log(index)});
	}
	history();
	
	
}