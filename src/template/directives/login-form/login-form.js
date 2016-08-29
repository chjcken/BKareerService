/**
 * Created by trananhgien on 7/11/2016.
 */

define(['app'], function(app) {


    var template = '<form name="userForm" id="login-form">'+
        '      <div class="head">'+
        '        <a class="tab-login" ng-click="isLoginActive=true" ng-class="{\'active\': isLoginActive}">Login</a>'+
        '        <a class="tab-signup" ng-click="isLoginActive=false" ng-class="{\'active\': !isLoginActive}" href="#signup">Sign Up</a>'+
        '      </div>'+
        '      <div class="tab-form-pane" ng-click="isLoginActive=true" ng-class="{\'active\': isLoginActive}" id="login">'+
        '        <div class="social">'+
        '          <h4>Connect with</h4>'+
        '          <ul>'+
        '            <li> '+
        '            <a fb-login href="" class="facebook">'+
        '              <span class="fa fa-facebook"></span>'+
        '            </a>'+
        '            </li>'+
        '            <li>'+
        '              <a g-login href="" class="google-plus">'+
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
        '          <label for="email">Email</label>'+
        '          <input ng-model="login_email" type="email" name="email" placeholder="email" required />'+
        '          <p class="help-block" ng-show="!userForm.email.$valid && userForm.email.$touched">Email is invalid</p>'+
        '          <label for="password">Password</label> '+
        '          <input ng-model="login_password" type="password" name="password" placeholder="password" required/>'+
        '          <p class="help-block" ng-show="userForm.password.$error.minlength">Password is at least 6 characters</p>'+
        '          <input ng-click="submit(userForm.$valid, true)" type="submit" value="Login" class="btn-login" />'+
        '          <p class="text-p">Don\'t have an account? <a ng-click="isLoginActive=false" href="#">Sign up</a> </p>'+
        '        </div>'+
        '      </div>'+
        ''+
        '      <div class="tab-form-pane " ng-click="isLoginActive=false" ng-class="{\'active\': !isLoginActive}" id="signup">'+
        '        <div class="input-field">'+
        '          <label for="email">Email <i style="color: red">*</i></label>'+
        '          <input ng-model="signup_email" type="email" name="email" required placeholder="email"/>'+
        '          <p class="help-block" ng-show="!userForm.email.$valid && userForm.email.$touched">Email is invalid</p>'+
        '          <label for="firstname">First name</label>'+
        '          <input ng-model="signup_firstname" type="text" name="firstname" placeholder="first name">'+
        '          <label for="lastname">Last name</label>'+
        '          <input ng-model="signup_lastname" type="text" name="lastname" placeholder="last name">'+
        '          <label for="password">Password <i style="color: red">*</i></label> '+
        '          <input ng-model="signup_password" type="password" name="password" placeholder="password" ng-minlength="6" required/>'+
        '          <p class="help-block" ng-show="userForm.password.$error.minlength">Password is at least 6 characters</p>'+
        ''+
        '          <input ng-click="submit(userForm.$valid, false)" ng-disabled="userForm.$invalid" type="submit" value="Register" class="btn-signup" />'+
        '        </div>'+
        '      </div>'+
        '    </form>';



    function loginForm () {
        return {
            restrict: 'E',
            scope: {
                onSubmit: "&"
            },
            template: template,
            link: function(scope, ele, attrs) {
                scope.submit = function(isValid, isLogin) {
                    scope.isLoginActive = true;

                    if (!isValid) alert("Please fill out information");
                    var data = isLogin ?
                    {
                        email: scope.login_email,
                        password: scope.login_password
                    } :
                    {
                        email: scope.signup_email,
                        firstname: scope.signup_firstname,
                        lastname: scope.signup_lastname,
                        password: scope.signup_password
                    }

                    scope.onSubmit(data, isLogin);
                }
            }
        }
    };

    app.directive('login-form', loginForm);

});