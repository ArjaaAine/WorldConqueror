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
            $uibModalInstance.close(minister);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });



