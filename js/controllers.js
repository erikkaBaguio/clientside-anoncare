/**
 * Created by irika-pc on 5/6/2016.
 * Controller - receive data from client
 */

angular.module('myApp').controller('loginController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.login = function () {

                // initial values
                $scope.error = false;
                $scope.disabled = true;

                // call login from service
                AuthService.login($scope.loginForm.username, $scope.loginForm.password)
                    // handle success
                    .then(function () {
                        $location.path('/dashboard');
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    })
                    // handle error
                    .catch(function () {
                        $scope.error = true;
                        $scope.errorMessage = "Invalid username and/or password";
                        $scope.disabled = false;
                        $scope.loginForm = {};
                    });

            };

        }]);

angular.module('myApp').controller('logoutController',
    ['$scope', '$location', 'AuthService',
        function ($scope, $location, AuthService) {

            $scope.logout = function () {

                // call logout from service
                AuthService.logout()
                    .then(function () {
                        $location.path('/');
                    });

            };

        }]);


/*
 * Source: http://stackoverflow.com/questions/12592472/how-to-highlight-a-current-menu-item
 */

angular.module('myApp').controller('NavigationController',
    ['$scope', '$location',
        function ($scope, $location) {

            $scope.isCurrentPath = function (path) {
                return $location.path() == path;
            };
        }]);