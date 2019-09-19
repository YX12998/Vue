var form001 = new Vue({
	el: "#form001",
	data: {

		isCreatingPerson: false,
		currentPerson: {
			// id: '1',
			// name: '张三',
			// age: '34',
			// tel: '43535345345',
			// addr: '啊时代发生地方',
			// persondesc: '45撒旦法撒旦法撒旦法',
			// exinfo: '是打发舒服',
			// tectype: ['java'],
			// imagepath: ""
		},
		namePeace: "xxx", 
		namePeaceLocked: false,  // 锁定标记, 不允许太频繁的向后台发送ajax
		nameLikes: [],
		allPerson: []
	},

	watch: {
		namePeace: function(){
			// 监听了namePeace的变化!!!!!
			console.info(this.namePeace);
			// 锁定标记, 不允许太频繁的向后台发送ajax
			if(!this.namePeace){
				console.info("无关键字");
				this.nameLikes = [];
				return; 
			}
			if( this.namePeaceLocked ){
				console.info("请求被锁定");
				return; 
			}
			this.namePeaceLocked = true;
			$.ajax({
				url: "/searchperson",
				type: 'get',
				dataType: 'json',
				data: {
					pName: this.namePeace
				},
				success: function(res){
					console.info(res);
					form001.nameLikes = res.data.likePersons;
				},
				complete: function(){
					console.info("请求完成,解锁");
					form001.namePeaceLocked = false;
				}
			});
			
		}
	},
	// computed:{
	// 	allPerson : function(){
	// 		return [ this.currentPerson, this.currentPerson ];
	// 	}
	// },

	methods: {
		
		
		
		// 点击列表响应
		selectOnePerson: function(item, index, event) {
			console.info(event.target);
			this.currentPerson = this.allPerson[index];
			//event.target.
			// $(event.target).addclass("selected");
		},


		// 查找单个用户信息
		getSingleUser: function() {
			$.ajax({
				url: "/getPersonById",
				type: "get",
				dataType: 'json',
				data: {
					personId: 5
				},
				success: function(res) {
					if (res.status != 'no') {
						// 因为是回调, 这里的this不再是我们的vue对象, 直接用vue对象的名字吧!!!!
						form001.currentPerson = res.data.person;
						form001.currentPerson.tectype = form001.currentPerson.tectype.split(',');
					}
				}
			});
		},

		// 批量查找person , 带分页功能,从第几个到第几个
		getPersonsByRange: function(fromIndex, max) {
			// 
			$.ajax({
				url: "/getAllPerson",
				type: 'get',
				dataType: 'json',
				success: function(res) {
					console.info(res);
					form001.allPerson = res.data.allPerson;
				}
			});

		},


		// 新增用户
		createPerson: function() {
			let currentPerson = this.currentPerson;
			// 容错 - 存在当前用户的id, 说明清理的不干净, 不能网后台传
			if (currentPerson.id || !this.isCreatingPerson || !currentPerson.name) {
				alert("请检查输入!");
				return;
			}

			let data2update = new window.FormData();

			for (var x in currentPerson) {
				data2update.append(x, currentPerson[x])
			}
			data2update.append("file1xxxxx", $('#facexxxxxxx')[0].files[0]);

			$.ajax({
				url: "/newPerson",
				type: "post",
				dataType: 'json',
				data: data2update,
				processData: false, // 使数据不做处理  // 必填!!!!					
				contentType: false, // 不要设置Content-Type请求头 // 必填!!!!

				// data: {
				// 	name: currentPerson.name,
				// 	age: currentPerson.age,
				// 	tel: currentPerson.tel,
				// 	addr: currentPerson.addr,
				// 	persondesc: currentPerson.persondesc,
				// 	exinfo: currentPerson.exinfo,
				// 	tectype: currentPerson.tectype.join(",")
				// },
				success: function(res) {
					console.info(res);
					// 新增成功后, 别忘了复位
					form001.isCreatingPerson = false;
					form001.getPersonsByRange();
				}
			});

		},

		// 新增用户之前, 清空form
		clearForm: function() {
			// 容错
			if (this.isCreatingPerson == true) {
				return; // 已经在编辑了, 不允许切换状态
			}
			var currentPerson = this.currentPerson;
			for (x in currentPerson) {
				currentPerson[x] = '';
			}
			currentPerson.tectype = []; // 容错
			this.isCreatingPerson = true;
		},

		// 编辑用户 未校验, 不做修改图标功能
		editPerson: function() {
			// 校验要不要提交图片 TODO - 暂时不做
			$.ajax({
				url: "/updatePerson",
				type: 'post',
				dataType: 'json',
				data: this.currentPerson,
				success: function(res) {
					alert("编辑用户成功!");
					form001.getPersonsByRange(); // 初始化获取所有用户
				},
				error: function(a, b) {
					console.info(a)
				}

			});

		}

	}
});

form001.getPersonsByRange(); // 初始化获取所有用户
