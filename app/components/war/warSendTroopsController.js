wciApp.controller(
    'warSendTroopsController',
    function (
        $scope,
        $uibModalInstance,
        playerService,
        warService,
        countryAttackedIndex,
        gameDataService) {

        $scope.military = playerService.military;
        $scope.queue = [];

        //initializing queue with units
        for(let i = 0; i < gameDataService.Units.length; i++) {
            $scope.queue[i] = {};
            let unitObject = {count: 0, name: gameDataService.Units[i].name, id: gameDataService.Units[i].id};
            $scope.queue[i] = unitObject;
        }
        $scope.updateQueue = function(unit, val) {
            console.log("Updating Queue: " + unit.name + " = " + val);
            $scope.queue[unit.id].count = val;//filtered index, can be 0 or higher
            // let filterQueue = $scope.queue.map(function(e) { return e.name}).indexOf(unit.name);//check if unit is already in queue and return its index
            // if(filterQueue === -1) {
            //     $scope.queue.push({count: val, name: unit.name, id: unit.id});
            // }else {
            //     $scope.queue[filterQueue].count = val;//filtered index, can be 0 or higher
            // }
            console.log($scope.queue);
        };
        $scope.sendQueuedUnits = function () {
            if($scope.queue.length) {
                //TODO: Increase upkeep cost etc...We should create some system for it tho, so it knows that we sent units
                warService.sendTroops($scope.queue, countryAttackedIndex);
                $scope.queue = [];//reset queue
            }
            $uibModalInstance.close('ok');//this calls sendTroops.result.then function in warController.js
        };
        $scope.cancel = function () {
            $scope.queue = [];//reset queue
            $uibModalInstance.dismiss('cancel');
        };
    });