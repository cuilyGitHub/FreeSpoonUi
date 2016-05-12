'use strict';

var $ = require('jquery-browserify');
var angular = require('angular');
var angular_route = require('angular-route');
var a = require('./modules/a');
var sugar = require('sugar');
var app = angular.module('app', ['ngRoute']);

app.service('$wxBridge',function($http, $location){
	var that = this;
	//this.inited = false;
	this.invoke=function(cb, params, callback){
		//if(that.inited){
			cb(params, callback);
			//return;
		//}
		//that.inited = true;
		
		//alert('1.1');
		//alert(window.location.href);
		/*$http.post('http://yijiayinong.com/api/wxConfig', {
			url: window.location.href,
			jsApiList: ['chooseWXPay', 'onMenuShareAppMessage', 'closeWindow']
		})
		.success(function(response){
			if(!response){
				return;
			}
			if(response.errcode != 'Success'){
				return;
			}
			if(!response.res){
				return;
			}
			if(!!response.res.wxConfig){
				wx.config(response.res.wxConfig);
				wx.ready(function(){
					function onBridgeReady(){
						alert('onBridgeReady');
						cb(params, callback);
					}
					if (typeof WeixinJSBridge == "undefined"){
						if( document.addEventListener ){
							document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
						}else if (document.attachEvent){
							document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
							document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
						}
					}else{
						onBridgeReady();
					}
				});
			}
		});*/
		
	};
	this.__closeWindowCallback = function(){
		//TODO
	};
	this.closeWindow=function(){
		that.invoke(that.__closeWindowCallback);
	};
	this.__configShareCallback = function(shareInfo){
		wx.onMenuShareAppMessage({
				  title: shareInfo.title, 
				  desc: shareInfo.desc, 
				  link: shareInfo.shareUrl, 
				  imgUrl: shareInfo.imgUrl,
				  //type: '', 
				  //dataUrl: '', 
				  success: function () {
						  //wx.closeWindow();
				  },
				  cancel: function () {
						  //pass
				  }
		   });
	};
	this.configShare=function(shareInfo){
		that.invoke(that.__configShareCallback, shareInfo);
	};
	this.__payCallback = function(payRequest, callback){
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', payRequest,
			function(res){
					alert(res.err_msg);
					if(res.err_msg == "get_brand_wcpay_request:ok" ) {
						callback();
					}
			}
		);
	};
	this.pay=function(payRequest, callback){
		//alert(window.location.href);
		//alert(payRequest);
		//that.invoke(that.__payCallback, payRequest, callback);
		WeixinJSBridge.invoke(
			'getBrandWCPayRequest', payRequest,
			function(res){
					alert(res.err_msg);
					if(res.err_msg == "get_brand_wcpay_request:ok" ) {
						callback();
					}
			}
		);
	};
})

app.service('$data',function($http,$location){	
	var that = this;
	this.getCode=function(){
		if(!that.codeId){
			var code=$location.search();
			that.codeId=code.code;
		}
		return that.codeId;
	}
    this.getBatchId=function(){
    	if(!that.batchId){
			var params=$location.search();	
        	that.batchId=params.state;
    	}
	    return that.batchId;
    }
	this.fetchBatchInfo = function(cb){
		if(!!that.batchInfo){
			cb(that.batchInfo);
			return;
		}
		$http.post("http://yijiayinong.com/api/batch", {
			batchId: that.getBatchId(),
			code: that.getCode(),
		})
		.success(function(response){
			that.openId=response.res.openId;
			that.batchInfo = response;
			cb(response);
		});
	};
	this.getAddress=function(cb){
		if(!!that.addressInfo){
			cb(that.addressInfo);
			return;
		}
		$http.post("http://yijiayinong.com/api/checkout",{
			batchId:that.getBatchId(),
			openId:that.openId,
			code:''
		})
		.success(function(response){
			that.addressInfo=response;
			cb(response);
		});
	};
	this.getOrders=function(cb){       
		if(!!that.ordersInfo){
			cb(that.ordersInfo);
			return;
		}
		$http.post("http://yijiayinong.com/api/orders",{
			openId:that.openId
		})
		.success(function(response){
			that.ordersInfo=response;
			cb(response);
		});
    };
    	this.getOrder=function(id, cb){       
		$http.post("http://yijiayinong.com/api/order",{
			orderId: id
		})
		.success(function(response){
			that.orderInfo=response;
			cb(response);
		});
    };
		this.getShareInfo=function(cb){
			$http.post('http://yijiayinong.com/api/shareInfo',{
				batchId:that.batchId
			})
			.success(function(response){
				that.ShareInfo=response;
				cb(response);
			})
		}
});



app.filter('convert',function(){
	return function(price){
		if(!!price){
			price=(price/100).toFixed(2);
		}
		return price;
	}
})

app.filter('safenum', function(){
	return function(input){
		if(!input){
			return 0;
		}
		return input;
	}
});

app.filter('int',function(){
	return function(price){
		if(!!price){
			price=parseInt(price/100);
		}
		return price;
	}
})

app.filter('fraction',function(){
	return function(price){
		if(!!price){
			price=(price%100);
			if(price==0){
				price="0"+price;
			}
		}
		return price;
	}
})

app.filter('date',function(){
	return function(createTime){
        var date=new Date();
        var str='';		
		if(!!createTime){
			date=Date.create(createTime);
		}
		return date.format('long', 'zh-CN');
	}
})

app.controller('IndexController', function($location,$scope, $routeParams, $data, $wxBridge){
	if(!$data.getBatchId()){
			$location.path("/error");
			return;
		}
	$data.getShareInfo(function(response){
		var shareInfo=response.res.data;
		$wxBridge.configShare(shareInfo);
	})
	$data.fetchBatchInfo(function(response){
		if(!response){
			$location.path("/error");
			return;
		}
		if(response.errcode!="Success"){
			$location.path("/error");
			return;
		}
		if(!response.res){
			$location.path("/error");
			return;
		}
		if(!response.res.data){
			$location.path("/error");
			return;
		}
		if(!response.res.data.commodities 
			|| !response.res.data.sponsor 
			|| !response.res.data.offered){
			$location.path("/error");
			return;
		}
      	$scope.commodities = response.res.data.commodities;
      	$scope.sponsor=response.res.data.sponsor;
      	$scope.offered=response.res.data.offered;
	});
	$scope.statement=function(){
		var commodities=$data.batchInfo.res.data.commodities;
		var num=0;
		for(var i=0;i<commodities.length;i++){
			var cur=commodities[i];
			if(cur.num){
				num+=cur.num;
			}				
		}
		if(!num){
				alert("请选择商品");
				return;
			}
		if(num>0){
			$location.path("/checkout");
		}
	}
	$scope.addCommodity = function(commodity){
		if(!commodity.num){
			commodity.num = 0;
		}
		commodity.num += 1;
	};
	$scope.removeCommodity = function(commodity){
		if(!commodity.num){
			commodity.num = 0;
		}
		commodity.num -= 1;
		if(commodity.num < 0){
			commodity.num = 0;
		}
	};
	(function(status){
	    $('.__overlay').on('click', function(){
	    	status = false;
	    	window.popup_window_from_bottom();
		});
		window.popup_window_from_bottom = function(){
			var total = 0;
			for(var _ in $scope.commodities){
				var commodity = $scope.commodities[_];
				if(!!commodity.num){
					total += commodity.num;
				}
			}
		    if(status&&total>0){
		        status = false;
		        $('.__overlay').css('display', 'block');
		        $('.popup-window-from-bottom').css("display","block");
		        $("#index").css("overflow","hidden");
		    } else {
		        status = true;
		        $('.__overlay').css('display', 'none');
		        $('.popup-window-from-bottom').css('display', 'none');
		        $("#index").css("overflow","auto");
		    }
		}
	})(true);

  	$scope.del=function(commodities){
  		for(var i=0;i<commodities.length;i++){
  			var cur=commodities[i];
  			if(!!cur.num){
  				cur.num=0;
  			}
  		}
	}

	$scope.$watch('commodities',function(newValue, oldValue){
		var num=0;
		var total=0;
		if(!newValue){
			return;	
		}
		for(var i=0;i<newValue.length;i++){
			var cur=newValue[i];
			if(!!cur.num){
				total+=cur.num*cur.price;
				num+=cur.num;
			}
		}
		if(num==0){
					$(".__amount").css('display', 'none');
					$('.__overlay').css('display', 'none');
			        $('.popup-window-from-bottom').css('display', 'none');
				}
				if(num>0){
					$(".__amount").css('display', 'block');
					$scope.num=num;
				}
        $scope.total=total;
	}, true)
});

app.controller('CheckController', function($scope, $routeParams,$data,$location,$http){
	if(!$data.getBatchId()){
			$location.path("/error");
			return;
		}
	$data.getAddress(function(response){
		if(!response){
			$location.path("/error");
			return;
		}
		if(response.errcode!="Success"){
			$location.path("/error");
			return;
		}
		if(!response.res){
			$location.path("/error");
			return;
		}
		if(!response.res.data){
			$location.path("/error");
			return;
		}
		if(!response.res.data.dists){
			$location.path("/error");
			return;
		}
		if(!!response.res.data.tel){
			$scope.tel=response.res.data.tel;
		}
		if(!!!!response.res.data.nickName){
			$scope.nickName=response.res.data.nickName;
		}
		$scope.address=response.res.data.dists;
		$scope.submit=function(p){
			$scope.selectedAddress = p;
		}
	});
	$data.fetchBatchInfo(function(response){
		var total=0;
		var num=0;
		$scope.commodities = response.res.data.commodities;
		var data=response.res.data.commodities;
		for(var i=0;i<data.length;i++){
			var cur=data[i];
			if(!!cur.num){
				num+=cur.num;
				total+=cur.num*cur.price;
			}
			if(num==0){		
				$location.path("/error");
				return;
			}
		}
        $scope.total=total;
	});
	var obj={};
	$scope.pay=function(commodities){	
		if(!$scope.nickName ||$scope.nickName.length==0){
			alert("昵称不存在");
			return;
		}
		if(!$scope.tel ||$scope.tel.length==0){
			alert("电话不存在");
			return;
		}
		if(!$scope.selectedAddress){
			alert("请选择取货地址");
			return;
		}
			obj.openid=$data.openId,
			obj.nickname=$scope.nickName,
			obj.tel=$scope.tel,
			obj.batch_id=$data.getBatchId(),
			obj.dist_id=$scope.selectedAddress.id,
			obj.puchared=[],
			obj.ipaddress="127.0.0.1";
		for(var i=0;i<commodities.length;i++){
			var cur=commodities[i]; 
			if(!!cur.num){
				var oder={};
				oder.id=cur.id;
				oder.num=cur.num;
				obj.puchared.push(oder);
			}
		}
		$http.post('http://yijiayinong.com/api/unifiedOrder',obj)
		.success(function(response){
			if(response.errcode=='Success'){
				if(!!response.res.orderId){
					$location.path('/order/'+response.res.orderId);
					return;
				}
			}
		})
		.error(function(){		
		});
	}
});

app.controller('OrderController', function($scope, $routeParams,$http,$data,$location,$wxBridge){
		var id=$routeParams.id;
		if(!id){
			$location.path("/error");
			return;
		}
		$data.getOrder(id, function(response){
			$scope.order=response.res.data;
			$scope.status=response.res.data.status;
			alert($scope.status);
			$scope.commodities=response.res.data.commodities;
			$scope.payRequest=response.res.payRequest;
		});	
		$scope.pay=function(){
			$wxBridge.pay($scope.payRequest, function(){
				$scope.isSuccess=true; 
				$scope.$apply(function(){
					$location.path("/share/"+id);
				});
			});
		}
		$scope.delOrder=function(){
			$http.post('http://yijiayinong.com/api/undo',{
				orderId:id
			})
			.success(function(response){
				var response=response;
				if(response.errcode=='Success'){
					$location.path("/orders");
					return;
				}
				if(response.errcode!='Success'){
					alert('取消订单失败');
				}
			})
			.error(function(){
			})
		}
});

app.controller('ShareController', function($scope, $routeParams, $location,$http){
	$scope.jump=function(){
		$location.path("/order/"+$routeParams.id);
	}
	$http.post('http://yijiayinong.com/api/orderAmount',{
		batchId:$routeParams.id
	})
	.success(function(response){
		$scope.orderAmount=response.res.orderAmount;
	})
});

app.controller('OrdersController', function($scope, $routeParams,$data,$location){
		if(!$data.openId){
			$location.path("/error");
			alert("no openId");
			return;
		}
		$data.getOrders(function(response){
			if(!response){
				$location.path("/error");
				alert("no response");
				return;
			}
			if(response.errcode!="Success"){
				$location.path("/error");
				alert("no Success");
				return;
			}
			if(!response.res){
				$location.path("/error");
				alert("no res");
				return;
			}
			if(!response.res.data){
				$location.path("/error");
				alert("no data");
				return;
			}
			$scope.orders=response.res.data;
		    $scope.length=response.res.data.length;
		});
        $scope.details=function(id){
			$location.path("/order/"+id);
		}
});

app.controller('ErrorController', function($scope, $routeParams){
	$scope.name = 'Page3Controller';
});


app.controller('MenuController', function($scope, $route, $routeParams, $location){
	//alert('MenuController');
	$scope.$route = $route;
});

app.config(function($routeProvider, $locationProvider){
	//alert('config');
	$routeProvider
		.when('/', {
			templateUrl: 'html/index.html',
			controller: 'IndexController'
		})
		.when('/checkout', {
			templateUrl: 'html/checkout.html',
			controller: 'CheckController',
			resolve: {
				response:['$q',function($q,$data){
					var deferred=$q.defer();
					$data.getAddress();
				}]
			}
		})
		.when('/order/:id', {
			templateUrl: 'html/order.html',
			controller: 'OrderController'
		})
		.when('/share/:id', {
			templateUrl: 'html/share.html',
			controller: 'ShareController'
		})
		.when('/orders', {
			templateUrl: 'html/orders.html',
			controller: 'OrdersController'
		})
		.when('/error', {
			templateUrl: 'html/error.html',
			controller: 'ErrorController'
		})
	$locationProvider.html5Mode(true);
});

(function initWXConfig(angular){
	var xmlhttp;
	if (window.XMLHttpRequest){
		xmlhttp=new XMLHttpRequest();
	} else {
		xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
	xmlhttp.onreadystatechange=function(){
		if (xmlhttp.readyState==4 && xmlhttp.status==200){
			var resText = xmlhttp.responseText;
			var resObj = (new Function('', 'return ' + resText))();
			if(!resObj){
				return;
			}
			if(resObj.errcode != 'Success'){
				return;
			}
			if(!resObj.res){
				return;
			}
			if(!!resObj.res.wxConfig){
				wx.config(resObj.res.wxConfig);
				wx.ready(function(){
					function onBridgeReady(){
						alert('onBridgeReady');
						//pass
						angular.bootstrap(document, ['app']);
					}
					if (typeof WeixinJSBridge == "undefined"){
						if( document.addEventListener ){
							document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
						}else if (document.attachEvent){
							document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
							document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
						}
					}else{
						onBridgeReady();
					}
				});
			}
		}
	}
	xmlhttp.open("POST", "http://yijiayinong.com/api/wxConfig", true);
	xmlhttp.setRequestHeader("Content-Type","application/json");
	var cfg = {
		url: window.location.href,
		jsApiList: ['chooseWXPay', 'onMenuShareAppMessage', 'closeWindow']
	};
	xmlhttp.send(JSON.stringify(cfg));
})(angular);
