/*******基础包***********/
var express = require('express');
var app = express();
var fs = require("fs");
const querystring = require('querystring');
var url = require('url');


/********增加request对body的支持 ******/
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
	extended: false
}));

/******增加数据库支持*************************/
const mysql = require("mysql");
const connection = mysql.createConnection({
	host: "localhost", //主机地址
	port: 3306, // 如果修改了数据库的默认端口3306, 这个属性不可忽略
	user: "root", //数据库person名
	password: "", //数据库person密码
	database: "fang" //数据库名
});
//数据库连接 立即连接数据库
connection.connect();

// 测试
// connection.query('select * from Person', 
// 	function (error, results, fields) {
// 		if (error){
// 			throw error;  
// 		} else{
// 		console.log('查询结果: ', results); 
// 	}
// });  //检验连接成功



/*******增加文件上传的支持********/
var multer = require('multer');
//app.use(multer({dest: '/tmp/'}).array('image'));  
// 接收的字段名是image??? 还是说接收的类型是image?? 真操蛋
app.use(multer({
	dest: '/tmp/'
}).any()); // 接收任意类型的文件, 也不限制上传的字段名, any()
// 不限制行不行


/*********设定静态目录***********/
app.use('/temp', express.static('temp'));
app.use('/public', express.static('public'));




/***************路由************************/

// 主页
app.get('/', function(req, res) {
	res.sendFile(__dirname + "/" + "demo10_编辑用户.html");
})



// 模糊查询person
app.get("/searchperson", function(request, respon) {
	var queryObj = url.parse(request.url, true).query;
	console.info(queryObj);
	if( !queryObj  || !queryObj.pName){
		
		respon.json({
			status: "no",
			data: {
				info: "无输入"
			}
		});
		return;
	}
	
	connection.query(" select name, id from person where name like '%"+ queryObj.pName  +"%'", function( error, results,fields) {
		if(error){
			throw error;
		}else{
			respon.json({
				status: "ok",
				data: {
					likePersons: results
				}
			});
		}

	});
});


// 获取单个person信息
app.get("/getPersonById", function(request, respon) {
	var queryObj = url.parse(request.url, true).query;
	if (!queryObj.personId) {
		respon.json({
			status: 'no',
			data: {
				info: "当前请求的参数不完整"
			}
		});
		return;
	}
	connection.query('select * from Person where id = "' + queryObj.personId + '"limit 1', function(error, results,fields) {
		
		if (error) {
			throw error;
		} else {
			console.info(results);
			respon.json({
				status: "ok",
				data: {
					person: results[0]
				}
			});
		}
	});
});


// 获取全部person信息
app.get("/getAllPerson", function(request, respon) {
	connection.query('select * from Person', function(error, results, fields) {
		if (error) {
			throw error;
		} else {
			respon.json({
				status: "ok",
				data: {
					allPerson: results
				}
			});
		}
	});

});

// 新增person
app.post("/newPerson", function(request, respon) {
	
	// 处理上传的文件
	// 容错: 
	let filePath = "none.jpg";
	if( request.files &&  request.files.length > 0 ){
		filePath =  new Date().getTime() + "-" + request.files[0].originalname;
		let des_file = __dirname + "/temp/" + filePath;
		console.info(filePath);
		fs.readFile(request.files[0].path, function(err, data) {
			fs.writeFile(des_file, data, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.info("文件保存成功");
				}
			});
		});		
	}
	var newPersonInfo = request.body;
	//console.info(newPersonInfo);
	var forSqlPar = "'" + newPersonInfo.name + "', " +
		"'" + newPersonInfo.age + "', " +
		"'" + newPersonInfo.tel + "', " +
		"'" + newPersonInfo.addr + "', " +
		"'" + newPersonInfo.persondesc + "', " +
		"'" + newPersonInfo.exinfo + "', " +
		"'" + newPersonInfo.tectype + "', " +
		"'" + filePath + "'";
	// 插入数据库
	var forsqlPer = "";
	forsqlPer += "insert into person (name, age, tel, addr, persondesc, exinfo, tectype, imagepath) values(";
	forsqlPer += forSqlPar;
	forsqlPer += ");";
	
	console.info(forsqlPer);
	
	// 执行新增
	connection.query(forsqlPer, function(error, results, fields) {
		if (error) {
			throw error;
		} else {
			respon.json({
				status: "ok",
				data: {
					info: "新增用户成功"
				}
			});
		}
	});




});


app.post("/updatePerson", function( request, respon){
	
	var newPersonInfo = request.body;
	//console.info(newPersonInfo);
	var sqlString = "update person set name='"+  newPersonInfo.name +"', " +
					"age='"	 + newPersonInfo.age +"', " +
					"tel='" + newPersonInfo.tel +"', " +
					"addr='" + newPersonInfo.addr +"', " +
					"persondesc='" + newPersonInfo.persondesc +"', " +
					"exinfo='" + newPersonInfo.exinfo +"', " +
					"tectype='" + newPersonInfo.tectype +"' " +
	"where id = " + newPersonInfo.id ;
	
	connection.query(sqlString, function(error, results, fields) {
		if (error) {
			throw error;
		} else {
			respon.json({
				status: "ok",
				data: {
					info: "编辑用户成功"
				}
			});
		}
	});
});



app.post('/file_upload', function(req, res) {
	var response = {};
	//   console.log(req.files[0]);  // 上传的文件信息 //   console.info(req.body);	// // substring(start,end) 
	var des_file = __dirname + "/temp/-" + new Date().getTime() + "-" + req.files[0].originalname;
	fs.readFile(req.files[0].path, function(err, data) {
		fs.writeFile(des_file, data, function(err) {
			if (err) {
				console.log(err);
			} else {
				response = {
					message: '文件上传成功',
					filename: req.files[0].originalname
				};
			}
			// console.log( response );
			res.end(JSON.stringify(response));
		});
	});
	//
})

var server = app.listen(7533, function() {

	var host = server.address().address
	var port = server.address().port

	console.log("应用实例，访问地址为 http://%s:%s", host, port)

})
