/**
 * Created by irika-pc on 5/6/2016.
 */

/**
 *Main Module of The Application
 */

var myApp = angular.module('myApp', ['ui.router']);

myApp.config(function ($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

    $stateProvider

    /*Authentication*/
        .state('login', {
            url: '/',
            templateUrl: 'pages/login.html',
            controller: 'loginController'
        })

        .state('dashboard', {
            url: '/dashboard',
            views: {
                '': {
                    templateUrl: 'pages/dashboard.html',
                    controller: 'NavigationController'
                },
                'dashboard@dashboard': {
                    templateUrl: 'pages/content/dashboard.html',
                    controller: 'NavigationController'
                },
            }
        })
        .state('dashboard.assessment-add', {
            url: '/assessments/add ',
            templateUrl: 'pages/content/assessment.html'
        })
});