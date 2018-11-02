// Universal excel loader, all you need to do is specify "sheets" array, which tells the function what to return to you.
// for example ["BuildingType", "Units"] as long as those 2 sheets are part of same excel file.
const getDataFromExcel = function ($q, sheets, fileName) {
  return $q((resolve, reject) => {
    // Pass an url or load default + Date string to load new file instead of cached.
    const path = `assets/excel/${fileName}`;
    const fileUrl = `${path}?_=${new Date().getTime()}`;
    const oReq = new XMLHttpRequest();

    oReq.open("GET", fileUrl, true);
    oReq.responseType = "arraybuffer";

    oReq.onload = function () {
      const arraybuffer = oReq.response;

      /* Convert data to binary string */
      const data = new Uint8Array(arraybuffer);
      const arr = [];

      for (let i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      const bstr = arr.join("");

      /* Call XLSX */
      const workbook = XLSX.read(bstr, { type: "binary" });

      /* DO SOMETHING WITH workbook HERE */

      const workbookSheets = {};

      for (let j = 0; j < sheets.length; j++) {
        const workbookSheet = workbook.Sheets[sheets[j]];

        // Raw so we get numbers instead of strings, header: 1 creates a 2D array
        const sheetData = XLSX.utils.sheet_to_json(workbookSheet, { header: 1,
          raw   : true });

        workbookSheets[sheets[j]] = {};
        const arra = [];

        // Work with 2d array and create an object.
        for (let l = 1; l < sheetData.length; l++) {
          const obj = {};

          for (let k = 0; k < sheetData[0].length; k++) {
            const property = sheetData[0][k];

            obj[property] = sheetData[l][k];
          }
          arra.push(obj);
        }
        workbookSheets[sheets[j]] = arra;
      }
      console.log("Finished initializing data from excel");
      resolve(workbookSheets);
    };
    oReq.send();
  });
};
