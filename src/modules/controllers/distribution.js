module.exports = function(app){

	app.controller('DistributionController', function($scope, $location, $data, $rootScope, data){

		$scope.data = data;
		//判断用户是不是第一次进该团购
		$rootScope.bulks = data.id
		
		$scope.isPick_point = true;
		$scope.isExpress = false;
		
		//判断用户最后选择的方式		
		if(data.receive_mode ==1){
			$scope.isPick_point = true;
			$scope.isExpress = false;
		}else if(data.receive_mode ==2){
			$scope.isPick_point = false;
			$scope.isExpress = true;
		}else if(data.receive_mode ==3){
			if($rootScope.receive_mode == 1){
				$scope.isPick_point = true;
				$scope.isExpress = false;
			}else if($rootScope.receive_mode == 2){
				$scope.isPick_point = false;
				$scope.isExpress = true;
			}
		}
		
		//用户信息处理
		if($rootScope.Consignee && $rootScope.userPhone){
			$scope.name = $rootScope.Consignee;
			$scope.mob = $rootScope.userPhone;
		}else{
			$scope.name = data.recent_obtain_name;
			$scope.mob = data.recent_obtain_mob;
		}
		
		
		//用户收货地址处理
		if(data.receive_mode ==2 || data.receive_mode ==3){
			(function(){
				$data.addressRequest(function(data){
					$scope.expressInfo = data;
				})
			})();
		}
		
		//选择收货地址
		$scope.selectExpress = function(e){
			$rootScope.expressId = e.id;
		}
		
		//修改自提用户信息
		$scope.reviseUser = function(){
			$location.path("/userInfoRevise");
		}
		
		//选择自提地址
		$scope.selectPick_point = function(x){
			$rootScope.selectedPick_point = x;
		}
		
		//修改地址
		$scope.update = function(id){
			$rootScope.fromDistribution = true;
			$data.address_id = id;
			$location.path("/del_address");
		}
		
		//添加地址
		$scope.add = function(){
			$rootScope.fromDistribution = true;
			$location.path('/new_address');
		}
		
		//返回确认订单页
		$scope.jumpCheckout = function(){
			if(!$rootScope.expressId && !$rootScope.selectedPick_point){
				$location.path('/checkout').replace();
				return;
			}
			if($scope.isExpress && $rootScope.expressId){
				//处理送货上门数据
				$rootScope.receive_mode = 2;
				$rootScope.selectAddres = $rootScope.expressId;
			}
			if($scope.isPick_point && $rootScope.selectedPick_point){
				//自提数据处理
				$rootScope.receive_mode = 1;
				$rootScope.selectAddres = $rootScope.selectedPick_point;
			}
			$location.path('/checkout').replace();
		}
		
		//选项卡
		$scope.pick_point = function(){
			$scope.isPick_point = true;
			$scope.isExpress = false;
		}
		$scope.express = function(){
			$scope.isPick_point = false;
			$scope.isExpress = true;
		}
		
	});
}