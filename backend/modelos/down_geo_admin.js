eje = function(arrays,origen,redisClient) {
	return new Promise(function(resolve, reject) {
	
		var textos = /^[A-Za-z\s]{0,100}/;
		var coment = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,100}/;
		var numero = /^[0-9\.\,]{0,10}/;
		var largoc = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,300}/;
		var valurl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
		var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;
		
		/*
		recibe token, y idasesor
		*/
		
		if (arrays.length==2){//token1 y token4
		
			var jwt = require('jsonwebtoken');
			jwt.verify(arrays[0], 'clWve-G*-9)1', function(err, decoded) {
				if (err) {
					reject([false,"1"]);
				}else if(decoded.t=="1" || decoded.t=="5"){
					
					/*
					lista contratos segun orden
					*/
					
					//[block.tokens[1],block.tokens[5],Numcuota,cedula];
					redisClient.keys("registry_*_contrato_"+arrays[1]+"_*",function(err,reply) {

						if(reply.length>0){

							var lista = [];
							function recurso(ind,arrs){
								if(ind==arrs.length){
									resolve([true,lista]);
								}else{

									var inus = arrs[ind].split("_");
									
									console.log("cliente_"+inus[1]);
									
									/*
									extrae cliente
									*/
									
									redisClient.get("cliente_"+inus[1],function(errs,datse){
									
										if(datse!==null) {
											var infes = JSON.parse(datse);

											var uno = infes[8];
                                            var tres = infes[10];
                                            var cedua = infes[7];
                                            var direc = infes[12];
                                            var tele = infes[17];
											
											/*guarda la data para ser emitidad despues*/
											
                                            redisClient.get("direccion_"+infes[13]+"_"+infes[14]+"_"+infes[15],function(errss,dastse) {
												if(dastse!==null){
													
													var latos = JSON.parse(dastse);
													lista.push({"user":uno+" "+tres,"cedula":cedua,"lat":latos[0],"lon":latos[1],"direcion":direc,"cel":tele});
													ind++;
													recurso(ind, arrs);
												
												}
											});
										}else{
											ind++;
											recurso(ind, arrs);
										}
									});

								}
							}

							recurso(0,reply);

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
