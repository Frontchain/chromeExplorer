const inputDecoder = async () => {
  const before = "ContentPlaceHolder1_privatenotediv";
  const title = "Decoded Input:";

  const rawInput = document.getElementById("rawinput");
  const input = rawInput.textContent.trim();

  if (input.length < 10) {
    return;
  }

  const signature = input.slice(0, 10);
  const data = `0x${input.slice(10)}`;

  const querySignature = await fetch(`https://www.4byte.directory/api/v1/signatures/?hex_signature=${signature}`);
  const response = await querySignature.json();

  if (response.results.length === 0) {
    const error = createErrorHTML("Signature doesn't exists on 4byte.directory");
    insertBefore(before, createRowHTML(title, error));
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
      continue;
    }
  }

  if (possibilities.length === 0) {
    const error = createErrorHTML("Could't decode the data");
    insertBefore(before, createRowHTML(title, error));
    return;
  }

  insertBefore(before, createRowHTML(title, possibilities));
}

inputDecoder().then(() => {});
