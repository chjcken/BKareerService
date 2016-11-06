/**
 * Created by trananhgien on 7/11/2016.
 */

define(['app'], function(app) {


    var template = '<div class="auth-form">'+
        '      <div class="head">'+
        '        <a class="tab-login" ng-click="isLoginActive=true" ng-class="{\'active\': isLoginActive}">Login</a>'+
        '        <a class="tab-signup" ng-click="isLoginActive=false" ng-class="{\'active\': !isLoginActive}">Sign Up</a>'+
        '      </div>'+
        '      <div ng-switch="isLoginActive">'+
        '      <form name="userForm" ng-switch-when="true" class="tab-form-pane" ng-class="{\'active\': isLoginActive}" id="login">'+
        '        <div class="social">'+
        '          <h4>Connect with</h4>'+
        '          <ul>'+
        '            <li> '+
        '            <a ladda="fbLoading" fb-login ng-click="onSubmit({data: {}, type: \'FACEBOOK\'})" class="facebook">'+
        '              <span class="fa fa-facebook"></span>'+
        '            </a>'+
        '            </li>'+
        '            <li>'+
        '              <a ladda="gLoading" g-login ng-click="onSubmit({data: {}, type: \'GOOGLE\'})" class="google-plus">'+
        '                <span class="fa fa-google-plus"></span>'+
        '              </a>'+
        '            </li>'+
        '          </ul>'+
        '        </div>'+
        ''+
        '        <div class="divider">'+
        '          <span>or</span>'+
        '        </div>'+
        '        <div class="input-field">'+
        '          <label for="email">{{login_email}}</label>'+
        '          <input ng-model="loginData.email" type="email" name="email" placeholder="email" required />'+
        '          <p class="help-block" ng-show="!userForm.email.$valid && userForm.email.$touched">Email is invalid</p>'+
        '          <label for="password">Password</label> '+
        '          <input ng-model="loginData.password" type="password" name="password" placeholder="password" required ng-minlength="6"/>'+
        '          <p class="help-block" ng-show="userForm.password.$error.minlength">Password is at least 6 characters</p>'+
        '          <button ladda="loginLoading" ng-click="loginSubmit(userForm.$valid)" ng-disabled="userForm.$invalid" class="btn-login">Login</button>'+

        '          <p class="text-p">Don\'t have an account? <a ng-click="isLoginActive=false" >Sign up</a> </p>'+
        '        </div>'+
        '      </form>'+
        ''+
        '      <form name="registerForm" class="tab-form-pane " ng-switch-when="false" ng-class="{\'active\': !isLoginActive}" id="signup">'+
        '        <div class="input-field">'+
        '          <label for="email">Email <i style="color: red">*</i></label>'+
        '          <input ng-model="registerData.email" type="email" name="email" required placeholder="email"/>'+
        '          <p class="help-block" ng-show="!registerForm.email.$valid && registerForm.email.$touched">Email is invalid</p>'+
        '          <label for="firstname">First name</label>'+
        '          <input ng-model="registerData.firstname" type="text" name="firstname" placeholder="first name">'+
        '          <label for="lastname">Last name</label>'+
        '          <input ng-model="registerData.lastname" type="text" name="lastname" placeholder="last name">'+
        '          <label for="password">Password <i style="color: red">*</i></label> '+
        '          <input ng-model="registerData.password" type="password" name="password" placeholder="password" ng-minlength="6" required/>'+
        '          <p class="help-block" ng-show="registerForm.password.$error.minlength">Password is at least 6 characters</p>'+
        ''+
        '          <button ladda="registerLoading" ng-click="registerSubmit(registerForm.$valid)" class="btn-signup" ng-disabled="registerForm.$invalid">Register</button>'+
        '        </div>'+
        '      </form>'+
        '      </div>'+
        '    </div>';



    function loginForm () {
        return {
            restrict: 'E',
            scope: {
                onSubmit: "&",
                loginLoading: "=",
                registerLoading: "=",
                gLoading: "=",
                fbLoading: "="
            },
            replace: true,
            template: template,
            link: function(scope, ele, attrs) {
                scope.isLoginActive = true;
                scope.loginData = {
                  email: "",
                  password: ""
                };
                
                scope.registerData = {
                  email: "",
                  firstname: "",
                  lastname: "",
                  password: ""
                };
                
                
                scope.loginSubmit = function(isValid) {
                    console.log("scope", scope.login_email);
                                        
                    console.log("call submit ");
                    
                    scope.onSubmit({data: scope.loginData, type: "LOGIN"});
                }
                
                scope.registerSubmit = function(isValid) {                 
                    
                  scope.onSubmit({data: scope.registerData, type: "REGISTER"});

                };
            }
        }
    };

    app.directive('loginForm', loginForm);

});