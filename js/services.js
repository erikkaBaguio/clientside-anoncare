/**
 * Created by irika-pc on 5/6/2016.
 * Services - API caller(functions)
 */

angular.module('myApp').factory('AuthService',
    ['$q', '$timeout', '$http',
        function ($q, $timeout, $http) {

            // create user variable
            var user = null;

            function isLoggedIn() {
                if (user) {
                    return true;
                } else {
                    return false;
                }
            }

            function getUserStatus() {
                $http.get('http://localhost:5000/anoncare.api/status')
                    // handle success
                    .success(function (data) {
                        if (data.status) {
                            user = true;
                        } else {
                            user = false;
                        }
                    })
                    // handle error
                    .error(function (data) {
                        user = false;
                    });
            }

            function login(username, password) {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a post request to the server
                console.log(username, password);
                $http.post('http://localhost:5000/anoncare.api/login/', {username: username, password: password})
                    // handle success
                    .success(function (data, status) {
                        if (status === 200 && data.status === 'OK') {
                            user = true;
                            deferred.resolve();
                        } else {
                            user = false;
                            deferred.reject();
                        }
                    })
                    // handle error
                    .error(function (data) {
                        console.log(data);
                        user = false;
                        deferred.reject();
                    });

                // return promise object
                return deferred.promise;

            }

            function logout() {

                // create a new instance of deferred
                var deferred = $q.defer();

                // send a get request to the server
                $http.get('http://localhost:5000/anoncare.api/logout')
                    // handle success
                    .success(function (data) {
                        user = false;
                        deferred.resolve();
                    })
                    // handle error
                    .error(function (data) {
                        user = false;
                        deferred.reject();
                    });

                // return promise object
                return deferred.promise;

            }


            // return available functions for use in controllers
            return ({
                isLoggedIn: isLoggedIn,
                login: login,
                logout: logout,
                getUserStatus: getUserStatus
            });

        }]);
