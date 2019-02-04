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

wciApp.filter("upperCase", [
  "$filter",
  function ($filter) {
    return function (string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    };
  },
]);