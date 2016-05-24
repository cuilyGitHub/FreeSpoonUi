// appMenu.js

'use strict';

//import require components
var angular = require('angular');
var sugar = require('sugar');

var app = angular.module('app', []);


app.filter('date',function(){
		return function(val){
			var date = new Date();
			if(!!val){
				date = Date.create(val);
			}
			return date.format('long', 'zh-CN');
		}
	});

app.config(function($locationProvider){
	$locationProvider.html5Mode({
	  enabled: true,
	  requireBase: false
	});
});	
	
app.controller('OpusController', function($scope, $http){
	var id=$location.search();
	if(!id.cookerid || !id.cookBookId){
		alert('id不存在');
		return;
	}
	id=JSON.stringify(id);
	$http.post('http://192.168.211.133:8083/api/user/getshareproduct',id)
	.success(function(data){
		if(!data.message=='get_success'){
			return;
		}
		$scope.cooks=data.result.products;
	})
});