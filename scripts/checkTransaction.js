const pendingTransactions = await web3.eth.getPendingTransactions()

const checkTransaction = pendingTransactions.filter((tx) => if (tx === transactionHash) {
  return true;
} else {
  return false;
})