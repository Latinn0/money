eje = function(arrays,origen,redisClient) {
	return new Promise(function(resolve, reject) {
				
		var textos = /^[A-Za-z\s]{0,100}/;
		var fecha = /^[0-9\/\%\s]{1,20}/;
		var numero = /^[0-9\.\,]{0,10}/;
		var largoc = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,300}/;
		var valurl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
		var correo = /^\w+([\.\+\-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/;
		
		
		/*
		recibe correo y clave
		*/
		
		if (arrays.length==2){
			
			if(correo.test(arrays[0]) && largoc.test(arrays[1]) ){
				
				/*
				verifica si exite
				*/
				
				redisClient.keys('usuario_'+arrays[0]+"_*",function(er2,repl2){
					if(repl2.length !== 0 ){
						redisClient.get(repl2[0],function(ser2,repls2){
							var info = JSON.parse(repls2);
							if(info[3]==true){
								if(info[1]==arrays[1]){
									
									/*verifica si es la clave y crea token util para el backend */
									
									var jwt = require('jsonwebtoken'),token = jwt.sign({"i":arrays[0],"d":info[5],"t":info[4],"n":info[6]},'clWve-G*-9)1',{ expiresIn: 60 * 60 * 12 });
									resolve([true,token,arrays[0],info[4],info[5],info[6]]);
								}else{
									reject([false,"4"]);
								}
							}else{
								reject([false,"3"]); //no ha sido aprobado por el super admin
							}
						});
					}else{
						reject([false,"1"]);
					}
				});
				
			}else{
				reject([false,"2"]);
			}
			
		}
		
	});
};

module.exports = eje;
