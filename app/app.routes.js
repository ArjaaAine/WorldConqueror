wciApp.config(function ($routeProvider) {
    $routeProvider
        .when('/',
            {
                templateUrl: 'app/components/government/internalAffairsView.html',
                controller: 'CountryController',
                controllerAs: 'countryCtrl'
            })
        .when('/changelog',
            {
                templateUrl: 'app/components/changelog/changelogView.html',
                controller: 'ChangelogController',
                controllerAs: 'cl'
            })
        .when('/structure',
            {
                templateUrl: 'app/components/structure/structureView.html',
                controller: 'StructureController',
                controllerAs: 'structureCtrl'
            })
        .when('/military',
            {
                templateUrl: 'app/components/military/militaryView.html',
                controller: 'MilitaryController',
                controllerAs: 'militaryCtrl'
            })
        .when('/research',
            {
                templateUrl: 'app/components/research/researchView.html',
                controller: 'ResearchController',
                controllerAs: 're'
            })
        .when('/war',
            {
                templateUrl: 'app/components/war/warView.html',
                controller: 'WarController',
                controllerAs: 'war'
            })
        .when('/charts',
            {
                templateUrl: 'app/shared/charts/chartsView.html',
                controller: 'ChartsController',
                controllerAs: 'charts'
            })
        .otherwise({
            redirectTo: '/'
        });
});

