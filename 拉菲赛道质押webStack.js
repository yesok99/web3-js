// async function delay(e) {
//   return  new Promise((resole,rejected)=>{

//         setTimeout(()=>{
//             // console.log('Promise');
//             resole()
//         },e);   
    
    
//     });
// };

async function stakeWithInviter(amountIn, parent,user,count=1){

    // web3.eth.abi.encodeFunctionSignature('stakeWithInviter(uint160,uint256,address)')

    // let nonce = await web3.eth.getTransactionCount(user.address);
    // const to = '0xccf5b75a6b5da87b51773a9cdd5aa2c7b580f817'
    // let amountOutMin = await getAmountOut(usdt,web,toWei(amountin/2));

    // let ain = toWei(amountin);
    // let abi =  web3.eth.abi.encodeParameters(['uint160','uint256','address'],[ain,amountOutMin[1],parent])
    // let FuncCode = '0x35d9f9c1' + abi.slice(2);

    // for(let i = 0; i< count ;i++){

    //     try{
            
    //         let ret = await sendTransaction(FuncCode ,user,to,'1.05',nonce);
    //         nonce ++;
    //         console.log(`第 ${i} 个质押成功 \n`)
    //         delay(1000);
            
    //     } catch(e) {

    //         console.log(`第 ${i} 个质押失败`);
    //         break;
    //         return;
    //     }

        
        
    // }
    
    // console.log(ret);

    var funcCode = [];

    for(let i=0; i<count; i++){

        let abi =  web3.eth.abi.encodeParameters(['uint160','uint256','address'],[amountIn,0,parent])
        abi = '0x35d9f9c1' + abi.slice(2);
        funcCode.push(abi);
    }
    
    await  batchSend(funcCode,to, user,gasRate=1.05)

    
}

//**************###############*******************
// parent = "0x1E41683A0897162BA5f86a6Af2EA9f94ADA355b5"
// parent = "0x32828b54cc86854f52d2d85af8af2c8d4b642f91"

// stakeWithInviter(1000,parent,w(0),5)


async function unstake(start, lastIndex){

    await getWebReward(start, lastIndex ,userWallet);
    

}


async function queryStake(start, end, addr = a(0)){

    const to = '0xccf5b75a6b5da87b51773a9cdd5aa2c7b580f817';
    var payload = [];

    for(let i = start; i <= end ; i++ ) {

            var abi = web3.eth.abi.encodeParameters(['address','uint256'],[addr,i]);

            abi = '0x08adb4be' + abi.slice(2);
        
            payload.push([to,abi]);
        
    }

    
    let tokenConstract = await new web3.eth.Contract(Multicall2.ABI, Multicall2.address);
		
		try{
				var stakeInfo = [];
                let res = await tokenConstract.methods.aggregate(payload).call();
                
                res[1].forEach( r => {

                    let info = web3.eth.abi.decodeParameters(['uint40','uint256','bool'],r);

                    stakeInfo.push(info);
                    
                })
            
            return stakeInfo;

        } catch(e) {

            console.error(e);
            return false;
        }


}


async function getWebReward(start, lastIndex ,user){

    const to = '0xccf5b75a6b5da87b51773a9cdd5aa2c7b580f817'
    var funcCode = [];
    

    let stakeInfo = await queryStake(start, lastIndex);

    let reward = 0;
    
    let date = new Date();
    let time = parseInt(date.getTime() / 1000);
    const COMPOUND = '1.000000115165872988';
    
    stakeInfo.forEach((r,index)=>{
    
        if(r[2] == false) {

          let abi =  web3.eth.abi.encodeParameter('uint256',index + start)
    
          abi = '0x2e17de78' + abi.slice(2);

          funcCode.push(abi);
            
          reward +=  myPow(COMPOUND,time - r[0]) * r[1];

          // console.log(`${index}`,r)
        }
    
        
    })

    // console.log(reward / 1e18);
    // console.log(funcCode);

    batchSend(funcCode,to, user,gasRate=1.05)
    
}



function myPow(x, n) {
  if (n === 0) {
    return 1;
  }
  if (n < 0) {
    x = 1 / x;
    n = -n;
  }
  let result = 1;
  while (n > 0) {
    if (n % 2 === 1) {
      result *= x;
    }
    x *= x;
    n = Math.floor(n / 2);
  }
  return result;
}



//swapWithNonce(usdt, web, toWei(1), 0.98, 1.05, w(0),5)


async function batchSwap(token0,token1,amountIn,user,count,gasRate) {


    var funcCode = [];
    let out = await getAmountOut(token0, token1, amountIn);
    
    for(let i=0;i<count;i++) {
    
        let amountOut = BigNumber(out[1]).multipliedBy(0.98).toFixed(0);
        const deadline = (Math.floor(Date.now() / 1000) + 1200).toString();
        const abi = await  routerConstract.methods.swapExactTokensForTokensSupportingFeeOnTransferTokens(
                amountIn, amountOut, [token0, token1], user.address, deadline).encodeABI();
        //打印当前时间
    
        funcCode.push(abi);
        
    }

    await batchSend(funcCode,router, user,gasRate);
}



async function batchSend(funcCode,to, user,gasRate=1) {

  const from = user.address;
  const nonce = await web3.eth.getTransactionCount(from, 'pending');
  const gasPrice = await web3.eth.getGasPrice();
  const gasLimit = 600000; // 假设每次交易需要600,000 gas
    


    let gas = await web3.eth.estimateGas({
    
        from: from,
        to: to,
        data: funcCode[0]
    });

  //签名
    
  var signs = [];
    
  for (let i = 0; i < funcCode.length; i++) {
    const transaction = {
      from: from,
      to: to,
      value: 0,
      gasPrice: gasPrice * gasRate,
      gasLimit: web3.utils.numberToHex(parseInt(gas * 2)),
      nonce: nonce + i,
      data: funcCode[i], // 假设代币合约有一个名为buy的方法
    };

    
    const signedTransaction = await web3.eth.accounts.signTransaction(transaction, user.privateKey);
    signs.push(signedTransaction)

  }

    var batch = new web3.BatchRequest();

    for (let i = 0; i < signs.length; i++) {

        let transation = web3.eth.sendSignedTransaction.request(signs[i].rawTransaction,(e,r)=>{
            
            console.log(`第 ${i} 个交易成功：`, r)})

        batch.add(transation);

    }

    batch.execute();
}