module.exports = function(app){

	app.controller('CheckController', function($scope, $location, $data, $rootScope, $wxBridge, batch){

		//配置微信分享
		$wxBridge.configShare(batch);
		
		//设置head头里title
		$rootScope.title = '订单确认';
		
		//数据绑定
		$scope.data = batch;
		$scope.commodities = batch.products;
		
		if($rootScope.bulks != batch.id){
			$rootScope.receive_mode = '';
		}
		//用户对配送方式选择处理
		if(!$rootScope.receive_mode){
			if($rootScope.Consignee &&　$rootScope.userPhone){
				$scope.mob = $rootScope.userPhone;
				$scope.name = $rootScope.Consignee;
				$scope.method = '自提点自提';
				$scope.default_receive_mode = 1;
				$scope.address = batch.storages[0].address;
			}else if(batch.receive_mode == 1 || batch.receive_mode == 3){
				$scope.method = '自提点自提';
				$scope.address = batch.storages[0].address;
				$scope.mob = batch.recent_obtain_mob;
				$scope.name = batch.recent_obtain_name;
				$scope.default_receive_mode = 1;
			}
			if(batch.receive_mode == 2){
				$scope.address = '请选择收货地址';
				$scope.mob = '';
				$scope.name = '';
			}	
		}else{	
			if($rootScope.receive_mode == 1){
				//处理自提数据
				if($rootScope.userPhone && $rootScope.Consignee){
					$scope.mob = $rootScope.userPhone;
					$scope.name = $rootScope.Consignee;
				}else{
					$scope.mob = batch.recent_obtain_mob;
					$scope.name = batch.recent_obtain_name;
				}
				if($rootScope.selectAddres){
					$scope.method = '自提点自提';
					$scope.address = $rootScope.selectAddres.address;
				}
			}
			if($rootScope.receive_mode == 2){  
				//处理送货上门数据
				if(!$rootScope.expressId){
					$scope.mob = '';
					$scope.name = '';
				}
				$scope.method = '送货上门';
				(function(){
					$data.addressRequest(function(data){
						for(var i=0;i<data.length;i++){
							if(data[i].id == $rootScope.selectAddres){
								$scope.expressInfo = data[i];
							}
						}
						$scope.mob = $scope.expressInfo.mob;
						$scope.name = $scope.expressInfo.name;
						$scope.address = $scope.expressInfo.address;
					})
				})();
			}
		}
		
		
		
		//选择配送方式
		$scope.jumpAddress = function(){
			$rootScope.fromCheckout = true;
			$location.path('/distribution');
		}
		
		//超出数量弹窗
		$scope.close_popup = function(){
			$scope.isShow = false;
		}
		
		//点击支付
		$scope.pay = function(commodities){
			if(!$scope.name || $scope.name.length == 0){
				alert("姓名不存在");
				return;
			}
			if(!$scope.mob || $scope.mob.length!=11){
				alert("电话不存在");
				return;
			}
			if(!$rootScope.receive_mode){
				if(!$scope.default_receive_mode || !$scope.address){
					alert("地址不存在");
					return;
				}
			}
			
			var puchared = [];
			for(var i = 0; i < batch.products.length; i++){
				var commodity = batch.products[i]; 
				if(!!commodity.num){
					puchared.push({
						product_id: commodity.id,
						quantity: commodity.num
					});
				}
			}
			
			//根据用户选择，配post服务器数据
			if($rootScope.receive_mode == 1){
				var requestData={
						receive_mode:$scope.receive_mode,
						obtain_name: $scope.name,
						obtain_mob: $scope.mob,
						bulk_id: batch.id,
						storage_id: $rootScope.selectAddres.id,
						goods: puchared
					};
			}
			if($rootScope.receive_mode == 2){
				var requestData={
						receive_mode:$scope.receive_mode,
						bulk_id: batch.id,
						shippingaddress_id: $rootScope.selectAddres,
						goods: puchared
					};
			}
			if(!$rootScope.receive_mode &&　$scope.default_receive_mode == 1){
				var requestData={
						receive_mode:$scope.default_receive_mode,
						obtain_name: $scope.name,
						obtain_mob: $scope.mob,
						bulk_id: batch.id,
						storage_id: batch.storages[0].id,
						goods: puchared
					};
			}
			
			//添加订单备注
			if(document.getElementById('note').value){
				requestData.comments = document.getElementById('note').value;
			}
			
			//向服务器post订单数据
			$data.requestUnifiedOrder(requestData, function(data){
				if(data.errcode == -1){
					$scope.isShow = true;
					$scope.overstepData = data.detail;
					return;
				}
				$data.ordersData = data;
				$rootScope.orderId = data.id;
				$location.path('/payment').replace();
			});
		}
	
	});

}