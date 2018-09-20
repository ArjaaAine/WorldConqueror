//universal excel loader, all you need to do is specify "sheets" array, which tells the function what to return to you.
//for example ["BuildingType", "Units"] as long as those 2 sheets are part of same excel file.
let getDataFromExcel = function ($q, sheets, url) {
    return $q(function (resolve, reject) {
        //pass an url or load default + Date string to load new file instead of cached.
        let path = url || "assets/excel/Data.ods";
        let fileUrl = path + "?_=" + new Date().getTime();
        let oReq = new XMLHttpRequest();
        oReq.open("GET", fileUrl, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function () {
            let arraybuffer = oReq.response;

            /* convert data to binary string */
            let data = new Uint8Array(arraybuffer);
            let arr = [];
            for (let i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            let bstr = arr.join("");

            /* Call XLSX */
            let workbook = XLSX.read(bstr, {type: "binary"});

            /* DO SOMETHING WITH workbook HERE */

            let workbookSheets = {};
            for (let j = 0; j < sheets.length; j++) {
                let workbookSheet = workbook.Sheets[sheets[j]];
                //raw so we get numbers instead of strings, header: 1 creates a 2D array
                let sheetData = XLSX.utils.sheet_to_json(workbookSheet, {header: 1, raw: true});
                workbookSheets[sheets[j]] = {};
                let arra = [];
                //work with 2d array and create an object.
                for (let l = 1; l < sheetData.length; l++) {
                    let obj = {};
                    for (let k = 0; k < sheetData[0].length; k++) {
                        let property = sheetData[0][k];
                        obj[property] = sheetData[l][k]
                    }
                    arra.push(obj);
                }
                workbookSheets[sheets[j]] = arra;
            }
            console.log("Finished initializing data from excel");
            resolve(workbookSheets);
        };
        oReq.send();
    })
};