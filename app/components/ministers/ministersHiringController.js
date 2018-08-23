'use strict';

wciApp.controller(
    'ministersHiringModalController',
    function (
        $scope,
        $uibModalInstance,
        allMinisters,
        nextMinisterCost) {

        $scope.ministers = [];

        $scope.hire = function (minister) {
            $uibModalInstance.close(minister);
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });



