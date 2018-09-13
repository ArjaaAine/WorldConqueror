'use strict';

wciApp.controller('ChangelogController', function ($scope) {

    //#region Default Values
    $scope.changeLogs =
    [
        //Version Level
        {
            number: '0.0.x',
            collapsed: false,
            subVersions: [
                {
                    number: '0.0.1',
                    logs: [
                        {
                            title: '',
                            description: 'Economic Buildings and Economic Stats.'
                        },
                        {
                            title: '',
                            description: 'Food Buildings and Consumption Stats.'
                        },
                        {
                            title: '',
                            description: 'Housing Buildings and Demographic Stats.'
                        },
                        {
                            title: '',
                            description: 'Color Coded growth meters'
                        },
                        {
                            title: '',
                            description: 'Pause Game Feature'
                        },
                        {
                            title: '',
                            description: '10x and 100x speed available'
                        },
                        {
                            title: '',
                            description: 'Buy 10, Buy 100 Buttons'
                        }
                    ]
                }
            ]

        }
    ]
    //#endregion

    //#region Page Load
    
    //#endregion

    //#region User Action Events

    $scope.changeLogPanelExpand = function (version) {

        for (let i = 0; i < this.changeLogs.length; i++)
        {
            if(this.changeLogs[i].number === version)
            {
                this.changeLogs[i].collapsed = !this.changeLogs[i].collapsed
            }
        }
    };
    //#endregion

});