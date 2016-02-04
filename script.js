'use strict';

angular.module('myApp', ['restangular', 'ui.router'])
  .config(['RestangularProvider', '$stateProvider', '$urlRouterProvider', function(RestangularProvider, $stateProvider, $urlRouterProvider) { 
    RestangularProvider.setBaseUrl('http://jsonplaceholder.typicode.com');
     
    $stateProvider
      .state("login", {
        url: "/login?loginError",
        templateUrl: "login.html",
        controllerAs: 'authCtrl',
        controller: function(AuthService, $state, $stateParams) {
          this.auth = () => {
            AuthService.setAuth(this.email, this.password);
            $state.go("auth");
          };
          
          this.loginError = !!($stateParams.loginError);
        }
      })
      .state("auth", {
        resolve: {
          auth: function(AuthService, $state) {
            return AuthService.checkAuth();
          }
        },
        controller: function($state, auth) {
          if (auth) {
            $state.go("letters", {folderId: '1'});
          } else {
            $state.go("login", {loginError: true});
          };
        }
      })
      
      .state("mail", {
        url: "/mail",
        template: "<mail-box></mail-box>"
      })
        .state("folders", {
          parent: "mail",
          url: "^/folders/:folderId",
          template: "<folders-list></folders-list>",
          params: {
             folderId: '1'
          }
        })
          .state("letters", {
            parent: "folders",
            url: "^/letters",
            template: "<letters-list></letters-list>"
          })
            .state("letter", {
              parent: "letters",
              url: "^/:letterId",
              template: "<letter-fullview></letter-fullview>"
            });
      
    $urlRouterProvider.otherwise("/login");
  }]) 
  .directive('mailBox', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {},
          templateUrl: 'mail-box.html'
      };
  }])
  .directive('mailBoxHeader', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {},
          templateUrl: 'mail-box-header.html'
      };
  }])
  .directive('foldersList', [function(){
      return {
          restrict: 'E',
          replace: true,
          scope: {},
          templateUrl: 'folders-list.html',
          controllerAs: 'foldersCtrl', 
          
          controller: ['Folders', '$stateParams', function(Folders, $stateParams) {
            this.activeFolder = $stateParams.folderId || 1;
            this.folders = Folders.getFolders();

          }]
      };
  }])
  .directive('folderItem', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {
            folder: "=",
            active: "="
          },
          templateUrl: 'folder-item.html'
      };
  }])
  .directive('lettersList', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {},
          templateUrl: 'letters-list.html',
          controllerAs: 'lettersCtrl', 
          
          controller: ['Letters', '$stateParams', '$state', function(Letters, $stateParams, $state) {
            this.activeFolder = $stateParams.folderId || 1;
            
            Letters.getLetters(this.activeFolder).then((response) => {
              this.letters = response;              
              $state.go('letter', { letterId: this.letters[0].id });
            });
          }]
      };
  }])
  .directive('letterShortView', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {
            letter: "="
          },
          templateUrl: 'letter-short-view.html'
      };
  }])
  .directive('letterFullview', [function() {
      return {
          restrict: 'E',
          replace: true,
          scope: {},
          templateUrl: 'letter-fullview.html',
          controllerAs: 'letterCtrl', 
          
          controller: ['Letters', '$stateParams', function(Letters, $stateParams) {
            this.activeLetter = $stateParams.letterId || 1;
            
            Letters.getLetter(this.activeLetter).then((response) => {
              this.letter = response;
            });
          }]
      };
  }])


  .service('Counter', function($timeout, Letters){

    this.folderGetter = function(num){
      Letters.getLetters(num).then(function(resp){
        console.log(resp.length);
        return resp.length;
      })
    }
  
  })


  
  .service("Folders", function($timeout, Counter) {


    let folders = [{
      id: 1,
      name: 'Inbox', 
      count: 1
    }, {
      id: 2,
      name: 'Sent', 
      count: function(){
        return Counter.folderGetter(1);
      }
    }, {
      id: 3,
      name: 'Spam', 
      count: Counter.folderGetter(1)
    }];
    
    
    this.getFolders = function() {
      
      return folders;
    }
  })



  .service("Letters", ['Restangular', function(Restangular) {
    this.getLetters = function(id) {
      return Restangular.one('users', id).getList('posts');
    };
    
    this.getLetter = function(letterId) {
      return Restangular.one('posts', letterId).get();
    };
  }])
  
  .service('AuthService', function() {
    let auth = {};
    
    this.setAuth = function(email, password) {
      auth.email = email;
      auth.password = password;
    }
    
    this.checkAuth = function() {
      if (auth.email == 'xz@xz.ru' && auth.password == '123') { 
        return true;
      }
      
      return false;
    } 
  });

