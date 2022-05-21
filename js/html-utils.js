const createErrorHTML = (msg) => {
  const span = document.createElement("span");
  span.className = "frontchain-error";
  span.innerHTML = msg;

  return span;
}

const createAddress = (param) => {
  const a = document.createElement("a");
  a.href = `${window.location.origin}/address/${param.value}`;
  a.target = "_blank";
  a.innerHTML = param.value;

  return a;
}

const createTransaction = (hash) => {
  const a = document.createElement("a");
  a.href = `${window.location.origin}/tx/${hash}`;
  a.target = "_blank";
  a.innerHTML = hash;

  return a;
}

const createUInt256 = (param) => {
  const eth = ethers.utils.formatUnits(param.value, "ether");
  const gwei = ethers.utils.formatUnits(param.value, "gwei");

  const span = document.createElement("span");
  span.setAttribute("data-container", "body");
  span.setAttribute("data-toggle", "popover");
  span.setAttribute("data-placement", "top");
  span.setAttribute("data-content", "top");
  span.className = "frontchain-popover";
  span.innerHTML = `${param.value} (${eth} Ether - ${gwei} GWei)`;

  return span;
}

const createParamHTML = (param) => {
  const type = document.createElement("div");
  type.className = "frontchain-type";
  type.innerHTML = param.type;

  const value = document.createElement("div");
  value.className = "frontchain-value";

  if (param.type === "address") {
    value.appendChild(createAddress(param));
  } else if (param.type === "address[]") {
    for (const addr of param.value) {
      value.appendChild(createAddress({ value: addr }));
    }
  } else if (param.type === "uint256") {
    value.appendChild(createUInt256(param));
  } else if (param.type === "uint256[]") {
    for (const addr of param.value) {
      value.appendChild(createUInt256({ value: addr }));
    }
  } else {
    value.innerHTML = param.value;
  }

  const row = document.createElement("div");
  row.className = "frontchain-param";
  row.appendChild(type);
  row.appendChild(value);

  return row;
}

const createDecoderHTML = (data) => {
  const method = document.createElement("p");
  method.className = "frontchain-method";
  method.innerHTML = data.method;

  const wrapper = document.createElement("div");
  wrapper.className = "frontchain-possibility";
  wrapper.appendChild(method);

  data.params.forEach(p => {
    wrapper.appendChild(createParamHTML(p));
  })

  return wrapper;
}

const createTxRowHTML = (hash, signature, position) => {
  const hashWrapper = document.createElement("div");
  hashWrapper.className = "frontchain-txhash";
  hashWrapper.appendChild(hash);

  const signatureWrapper = document.createElement("div");
  signatureWrapper.className = "frontchain-signature";
  signatureWrapper.appendChild(signature);

  const positionWrapper = document.createElement("div");
  positionWrapper.className = "frontchain-position";
  positionWrapper.appendChild(position);

  const wrapper = document.createElement("div");
  wrapper.className = "frontchain-prevtx";
  wrapper.appendChild(hashWrapper);
  wrapper.appendChild(signatureWrapper);
  wrapper.appendChild(positionWrapper);

  return wrapper;
}

const createPreviousTransactionsHTML = (trxs) => {
  const hashTitle = document.createElement("strong");
  hashTitle.innerHTML = "Transaction Hash";

  const signatureTitle = document.createElement("strong");
  signatureTitle.innerHTML = "Signature";

  const positionTitle = document.createElement("strong");
  positionTitle.innerHTML = "Position";

  const table = document.createElement("div");
  table.className = "frontchain-table";
  table.appendChild(createTxRowHTML(
    hashTitle,
    signatureTitle,
    positionTitle
  ));

  for (const tx of trxs) {
    const signature = tx.data.slice(0, 10);

    table.appendChild(createTxRowHTML(
      createTransaction(tx.hash),
      document.createTextNode(signature),
      document.createTextNode(tx.transactionIndex)
    ));
  }

  const wrapper = document.createElement("div");
  wrapper.className = "frontchain-table-wrapper";
  wrapper.appendChild(table);

  return wrapper;
}

const createRowHTML = (title, element) => {
  const hr = document.createElement("hr");
  hr.className = "hr-space";

  const rightCol = document.createElement("div");
  rightCol.className = "col-md-9 frontchain-right";

  if (Array.isArray(element)) {
    for (const e of element) {
      rightCol.appendChild(e);
    }
  } else if (element) {
    rightCol.appendChild(element);
  }

  const leftCol = document.createElement("div");
  leftCol.className = "col-md-3 font-weight-bold font-weight-sm-normal mb-1 mb-md-0"
  leftCol.innerHTML = title

  const row = document.createElement("div");
  row.className = "row";
  row.appendChild(leftCol);
  row.appendChild(rightCol);

  const container = document.createElement("div");
  container.id = "frontchain-extra";
  container.appendChild(hr);
  container.appendChild(row);

  return container;
}

const insertBefore = (id, element) => {
  const target = document.getElementById(id);
  const parentTarget = document.getElementById("ContentPlaceHolder1_maintable");
  parentTarget.insertBefore(element, target);
}
