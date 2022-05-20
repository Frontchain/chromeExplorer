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

  console.log(param);

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

const createRowHTML = (element) => {
  const hr = document.createElement("hr");
  hr.className = "hr-space";

  const leftCol = document.createElement("div");
  leftCol.className = "col-md-9";

  if (Array.isArray(element)) {
    for (const e of element) {
      leftCol.appendChild(e);
    }
  } else if (element) {
    leftCol.appendChild(element);
  }

  const rightCol = document.createElement("div");
  rightCol.className = "col-md-3 font-weight-bold font-weight-sm-normal mb-1 mb-md-0"
  rightCol.innerHTML = "Decoded Input:"

  const row = document.createElement("div");
  row.className = "row";
  row.appendChild(rightCol);
  row.appendChild(leftCol);

  const container = document.createElement("div");
  container.id = "frontchain-decoder";
  container.appendChild(hr);
  container.appendChild(row);

  return container;
}

const insertDecoder = (element) => {
  const target = document.getElementById("ContentPlaceHolder1_privatenotediv");
  const parentTarget = document.getElementById("ContentPlaceHolder1_maintable");
  parentTarget.insertBefore(element, target);
}


const main = async () => {
  const rawInput = document.getElementById("rawinput");
  const input = rawInput.textContent.trim();

  if (input.length < 10) {
    return;
  }

  const signature = input.slice(0, 10);
  const data = `0x${input.slice(10)}`;

  console.log(signature, data);

  const querySignature = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}`);
  const response = await querySignature.json();

  console.log("response", response);

  if (response.results.length === 0) {
    const error = createErrorHTML("Signature doesn't exists on 4byte.directory");
    insertDecoder(createRowHTML(error));
    return;
  }

  const possibilities = [];
  for(const m of response.results) {
    const method = m.text_signature;
    const params = Array.from(method.matchAll(/.*?\((.*)\)/g),  m => m[1])[0].split(",");
    try {
      const decoded = ethers.utils.defaultAbiCoder.decode(params, data);
      const decodedParams = [];
      for (const i in decoded) {
        decodedParams.push({
          type: params[i],
          value: decoded[i]
        });
      }

      const possibility = {
        method: method,
        params: decodedParams
      };

      possibilities.push(createDecoderHTML(possibility));
    } catch (e) {
      console.log(e);
      continue;
    }
  }

  if (possibilities.length === 0) {
    const error = createErrorHTML("Could't decode the data");
    insertDecoder(createRowHTML(error));
    return;
  }

  insertDecoder(createRowHTML(possibilities));
}

main().then(() => {});
