var app = angular.module('Events', ['ngRoute','ngCookies']);
app.config(function ($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'home.html'
        , controller: 'HomeCtrl'
    }).when('/signUp', {
        templateUrl: 'signup.html'
        , controller: 'SignUpCtrl'
    });
});

app.run(function($cookies,$rootScope){
    if($cookies.get('token')){
       $rootScope.token=$cookies.get('token');
       $rootScope.Currentuser=$cookies.get('currentuser');
     
       }
});


app.controller('HomeCtrl', function ($scope, $http, $location,$cookies,$rootScope) {
    //When signup button is clicked
    $scope.signupclick = function () {
        console.log("In signup page");
        $location.path("signUp");
    };
    //When You click Submit Button  
    $scope.submitEvent = function () {
        $http.post('/eventsfromfront', {
            PostedEvent: $scope.typeevent,
            PostedDescription:$scope.typedesc}, {
            headers:{'authorization':$rootScope.token}}).then(function () {
            $scope.allevents();
            $scope.typeevent = '';
            $scope.typedesc = '';
        });
    };
    //------------------
    //To get the events from Server side  ->
    $rootScope.$on("getEvents",function(){
        $rootScope.allevents();
    });
    
     $rootScope.allevents=function() {
        $http.get('/eventsfromserver').then(function (response) {
            $scope.events = response.data;
            $cookies.put('refreshevents',$scope.events);
            
            return response.data;
        });
    }
     $rootScope.allevents();
    
    
    
    //To del the events from front end   ->
    $scope.deleteEvent = function (event) {
        
       
        $http.put('/deleteEvents', {
            DeletingEvent: event
        },{
            headers:{'authorization':$rootScope.token}}).then(function () {
            $scope.allevents();
        });
    };
    
    //when login is clicked
    $scope.loginclick = function () {
        console.log("Logging In");
        $http.put('/userlogging',{username: $scope.uname,password: $scope.upass})
            .then(function(res){
            
            $cookies.put('token',res.data.token);
            $cookies.put('currentuser',$scope.uname);
            $rootScope.token=res.data.token;
            $rootScope.Currentuser= $scope.uname;
            $scope.allevents();
            $scope.uname="";
            $scope.upass="";
            /*alert("Success");*/
        },function(err){
            alert("Bad Login ");
        });
        
       
       
    };        
    
        
    
        /*When log out button is clicked*/
            $scope.backhome = function () {
            $cookies.remove('token');
            $cookies.remove('currentuser');
            $rootScope.token=null;
            $rootScope.Currentuser=null;
            
    
    
    
    

    };
});
app.controller('SignUpCtrl', function ($scope, $http, $location) {
    $scope.Submitsignupclick = function () {
        var newUser = {
            username: $scope.uemail,
            password: $scope.pass
        };
        $http.post('/userregister', newUser).then(function () {
            alert('success');
        });
    };
    <!-- When signup button is clicked>
    $scope.backtohome = function () {
        $location.path("/");
    };
});
