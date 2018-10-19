'use strict';

wciApp.filter('roundInt',  ['$filter', function ($filter) {
    return function (input) {
        var roundNum = Math.round(input);
        return roundNum;
    };
}]);

wciApp.filter('fixedDecimalPlaces', ['$filter', function ($filter){

    return function (input, decimals) {
        var returnNum = input.toFixed(decimals);
        return returnNum;
    };
}]);

wciApp.filter('niceNumber', ['$filter', function ($filter) {

    return function (number) {
        //Regexp helps with replace all. 
        number = number.toString().replace(new RegExp(',','g'), '');
        var absVal = Math.abs(number);

        var suffixes = ["K", "M", "B", "T", "Qd", "Qt", "Sx", "Sp", "Oc", "No", "Dc", "Un", "Du", "Tr", "Qud", "Qun", "Sed", "Sep", "Oct", "Nov", "Vig", "Cen"];

        for (var i = suffixes.length - 1; i >= 0; i--) {
            if (absVal >= Math.pow(1000, i + 1)) {
                var multiple = (number / Math.pow(1000, i + 1));
                var decimal = decimalPlaces(multiple, 2);

                return multiple.toFixed(decimal) + suffixes[i];
            } else if (absVal < Math.pow(1000, 1)){
                //For small numbers no decimals.
                return parseInt(number).toFixed(0);
            }
        }
    };

}]);


//#region Private Methods
//This calculates the number of decimal places needed.
function decimalPlaces(num, min) {
    var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match) { return 0; }
    return Math.min(
         min,
         //Number of digits right of decimal point.
         (match[1] ? match[1].length : 0)
         //Adjust for scientific notation.
         - (match[2] ? +match[2] : 0));
};
//#endregion