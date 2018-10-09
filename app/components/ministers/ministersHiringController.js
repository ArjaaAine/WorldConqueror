'use strict';

wciApp.controller(
    'ministersHiringModalController',
    function (
        $scope,
        $uibModalInstance,
        allMinisters,
        nextMinisterCost) {

        $scope.ministers = [];
        $scope.allMinisters = allMinisters;
        $scope.nextMinisterCost = nextMinisterCost;

        $scope.hire = function (minister) {
            console.log("hire");
            $uibModalInstance.close(minister.ministerType);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });



