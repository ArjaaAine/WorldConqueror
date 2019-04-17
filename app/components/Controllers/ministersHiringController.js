'use strict';

wciApp.controller(
    'ministersHiringModalController',
    function (
        $scope,
        $uibModalInstance,
        remainingMinisters,
        nextMinisterCost) {

        $scope.ministers = [];
        $scope.remainingMinisters = remainingMinisters;
        $scope.nextMinisterCost = nextMinisterCost;

        $scope.hire = function (minister) {
            console.log("hire");

            $uibModalInstance.close(minister.ministerType);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });



