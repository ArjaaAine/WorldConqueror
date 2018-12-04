"use strict";
// eslint-disable-next-line
wciApp.factory("leaderService", function (gameDataService, $filter) {
  const leaders = {};

  leaders.currentLeader = {
    bonuses  : {},
    negatives: {},
  };
  leaders.list = [];
  leaders.selectedIndex = 0;

  leaders.init = function () {
    leaders.list = [];
    const leadersData = gameDataService.Leaders;

    for (const leader of leadersData.values()) {
      const bonus = $filter("split")(leader.bonus);
      const bonusName = this.getDescription(bonus);
      const bonusValue = $filter("split")(leader.bonusValue).map(string => parseFloat(string));
      const description = leader.description;
      const name = leader.name;
      const negative = $filter("split")(leader.negative);
      const negativeName = this.getDescription(negative);
      const negativeValue = $filter("split")(leader.negativeValue).map(string => parseFloat(string));
      const bonuses = this.makeObject(bonus, bonusValue, bonusName);
      const negatives = this.makeObject(negative, negativeValue, negativeName);

      const leaderObject = {};

      Object.assign(leaderObject, { bonuses,
        negatives,
        description,
        name });
      leaders.list.push(leaderObject);
    }
  };

  leaders.bonusCalculator = function (name, defaultValue) {
    const leader = this.currentLeader;

    if (leader.bonuses[name]) return leader.bonuses[name].value;

    if (leader.negatives[name]) return leader.negatives[name].value;

    return defaultValue;
  };

  leaders.makeObject = function (arr, values, name) {
    const obj = {};

    for (const [ index, value ] of arr.entries()) {
      obj[value] = {};
      obj[value].name = name[index];
      obj[value].value = values[index];
    }

    return obj;
  };

  leaders.getDescription = function (data) {
    const descriptionsData = gameDataService.LeadersStatDescription;
    const description = [];

    for (const item of data.values()) {
      const desc = descriptionsData[item];

      description.push(desc);
    }

    return description;
  };

  leaders.select = function (index) {
    leaders.selectedIndex = index;
  };

  leaders.choose = function () {
    leaders.currentLeader = leaders.list[this.selectedIndex];
    console.log(this);
  };

  return leaders;
});
