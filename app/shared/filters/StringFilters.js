"use strict";

wciApp.filter("split", [
  "$filter",
  function ($filter) {
    return function (string) {
      const array = string.split(", ");

      return array;
    };
  },
]);
