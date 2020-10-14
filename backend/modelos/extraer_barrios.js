eje = function(arrays,origen,redisClient) {
	return new Promise(function(resolve, reject) {
	
		var textos = /^[A-Za-z\s]{0,100}/;
		var coment = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,100}/;
		var numero = /^[0-9\-\,]{0,10}/;
		var largoc = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,300}/;
		var valurl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
		var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
		
		/*
		recibo token, departamento y cuidad
		*/
		
		
		if (arrays.length==3){
			
		
			var jwt = require('jsonwebtoken');
			jwt.verify(arrays[0], 'clWve-G*-9)1', function(err, decoded) {
				if (err) {
					reject([false,"1"]);
				}else if(decoded.t=="0" || decoded.t=="1" || decoded.t=="2"  || decoded.t=="5" ){
					
					/*
					realizo el request en redis lo unifio y muestro
					*/
					
					redisClient.keys('direccion_'+arrays[1]+'_'+arrays[2]+'_*',function(err3,reply3){
						if(reply3.length > 0){
							
							String.prototype.capitalize = function() {
								return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
							}
							
							var lista = [];
							for(var h=0; h<reply3.length; h++){
								var add = reply3[h].split("_");
								lista.push(add[3].capitalize());
							}
							
							function onlyUnique(value, index, self) { 
								return self.indexOf(value) === index;
							}
							
							var sal = lista.filter(onlyUnique);
							var ordenado = sal.sort();
							resolve([true,ordenado]);
							
						}else{
							reject([false,"4"]);
						}
					});
					
				}else{
					reject([false,"2"]);
				}
			});
			
		}else{
			reject([false,"3"]);
		}
		
	});
};

module.exports = eje;
