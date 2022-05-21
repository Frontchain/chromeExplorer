const getBlockNumber = () => {
  const blockLink = document.querySelector('[href*="/block/"]');
  return parseInt(blockLink.textContent, 10);
}

const getPosition = () => {
  let positions = document.querySelectorAll('[title="Index position of Transaction in the block"]');
  if (positions.length > 1) {
    return parseInt(positions[1].textContent, 10);
  }

  positions = document.querySelectorAll('[data-original-title="Index position of Transaction in the block"]');
  if (positions.length > 1) {
    return parseInt(positions[1].textContent, 10);
  }

  positions = document.querySelectorAll('[class="u-label u-label--value u-label--secondary rounded mr-1 mb-1"]');
  if (positions.length > 2) {
    const position = positions[2].querySelector(":scope > .text-dark");
    return parseInt(position.textContent, 10);
  }
  
  return undefined;
}

const previousTransactions = async () => {
  const before = "ContentPlaceHolder1_privatenotediv";
  const title = "Previous Transactions:";

  const rpc = networks[window.location.hostname];
  if (!rpc) {
    return;
  }

  const blockNumber = getBlockNumber();
  const position = getPosition();

  if (!blockNumber || !position) {
    return;
  }

  const provider = new ethers.providers.JsonRpcProvider(rpc);
  const block = await provider.getBlockWithTransactions(blockNumber);
 
  const previousTransactions = block.transactions.filter((tx) => (tx.transactionIndex < position));
  previousTransactions.sort(function(a, b) {
    return b.transactionIndex - a.transactionIndex;
  });

  console.log(previousTransactions);
  const list = createPreviousTransactionsHTML(previousTransactions);
  insertBefore(before, createRowHTML(title, list));
}

previousTransactions().then(() => {});
