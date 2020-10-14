eje = function(arrays,origen,redisClient) {
	return new Promise(function(resolve, reject) {
	
		var textos = /^[A-Za-z\s]{0,100}/;
		var coment = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,100}/;
		var numero = /^[0-9\.\,]{0,10}/;
		var largoc = /^[A-Za-z0-9\-\_\.\;\#\$\%\s]{0,300}/;
		var valurl = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/;
		var correo = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/;


		/*
		recibo tokens, cedula ,idasesor ,monto a prestar ,cicloendiad, fecha_prestamoNoSEUSA, descontarCUOTADEuNA, porcentajeDEPRESTAMO ,quedo_cuotauNICA, IDEMPRESA, dIARIOSEMANALMENSUAL]
		*/
			
		if (arrays.length==11){
		
			var jwt = require('jsonwebtoken');
			jwt.verify(arrays[0], 'clWve-G*-9)1', function(err, decoded) {
				if (err) {
					reject([false,"1"]);
				}else if(decoded.t=="1" || decoded.t=="2" || decoded.t=="5"){


					if(arrays[0]!==null && arrays[1]!==null && arrays[2]!==null && arrays[3]!==null && arrays[4]!==null && arrays[5]!==null && arrays[6]!==null && arrays[7]!==null && arrays[8]!==null && arrays[9]!==null && arrays[10]!==null ){
						
						function randomIntFromInterval(min,max){
							return Math.floor(Math.random()*(max-min+1)+min);
						}
						var ids = randomIntFromInterval(1000000,9999999);
						
						/*
						agrego otros valores al array principal y verififico la configuracion que tengo a crear el contrato
						*/
						
						arrays[0] = decoded.d;
						arrays.push(0);
						arrays.push(ids);

						redisClient.get("configuracion_" + arrays[9], function (err, reply) {
							
							if(reply!==null){
								var info = JSON.parse(reply);
								var extric = info[11];

								redisClient.keys("registry_"+arrays[1]+"_contrato_"+arrays[0]+"_*",function(ersr,replsy) {
									if(replsy.length>0){
										var miEmpresa = replsy.length;
									}else{
										var miEmpresa = 0;
									}
									
									/*
									verifiquo si tiene otros contratos
									
									*/
									redisClient.keys("registry_"+arrays[1]+"_contrato_*",function(erxsr,replxsy) {
										if(replsy.length>0){
											var otrasEmpresa = replxsy.length - miEmpresa;
										}else{
											var otrasEmpresa = 0;
										}
										
										/*
										verifiquo si tiene otros contratos en otras empresas
										
										*/

										if(extric=="3" && miEmpresa>0){
											resolve([false,"4",miEmpresa]);
										}else if(extric=="3" && otrasEmpresa>0 ){
											resolve([false,"5",otrasEmpresa]);
										}else{
		
											var moment = require("moment");
											
											/*
											creo la cantidad de cuotas que require segunel ciclo que tengan
											*/
											
											var fes =[];
											if(arrays[10]=="2"){
												
												var cuotaD = arrays[8].replace(".",""),
													cuotaD2 = cuotaD.replace(".",""),
													tiempo = arrays[4],
													indi = moment().format('E'),
													residuo = 7 - indi,
													prox = moment().add(residuo, 'days').format('YYYY-MM-DD');
												fes.push({"cp":cuotaD2,"ct":false,"fe":prox,"pe":0});
												
												for(var k = 1; k < tiempo+1; k++){
													var prox2 = moment(prox).add(7, 'days').format('YYYY-MM-DD');
													fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
													prox = prox2;
												}
												
												if(fes.length > parseInt(arrays[4])){
													fes.pop();
												}
												
											}else if(arrays[10]=="1"){
												
												var cuotaD = arrays[8].replace(".",""),
													cuotaD2 = cuotaD.replace(".",""),
													indi = moment().format('E'),
													residuo = (7 - indi),
													prox = moment().format('YYYY-MM-DD'),
													tiempo = arrays[4],
													acum=1;

												fes.push({"cp":cuotaD2,"ct":false,"fe":prox,"pe":0});
												for(var k = 1; k < tiempo; k++){

													if(k<residuo){
														var prox2 = moment(prox).add(1, 'days').format('YYYY-MM-DD');
														fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
														prox = prox2;

													}else if(k==residuo){
														prox = moment(prox).add(1, 'days').format('YYYY-MM-DD');
														acum++;

														var prox2 = moment(prox).add(1, 'days').format('YYYY-MM-DD');
														fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
														prox = prox2;
													}else if(k>residuo){
														if(acum==7){
															prox = moment(prox).add(1, 'days').format('YYYY-MM-DD');
															acum=1;
														}
														var prox2 = moment(prox).add(1, 'days').format('YYYY-MM-DD');
														fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
														prox = prox2;
														acum++;
													}

													 if(k==1){
														 tiempo++;
													 }

												}
												
												if(fes.length > parseInt(arrays[4])){
													fes.pop();
												}
												
											}else if(arrays[10]=="3"){
												
												var cuotaD = arrays[8].replace(".",""),
													cuotaD2 = cuotaD.replace(".",""),
													prox = moment().format('YYYY-MM-DD'),
													tiempo = arrays[4];
													
												fes.push({"cp":cuotaD2,"ct":false,"fe":prox,"pe":0});
												for(var k = 1; k < tiempo+1; k++){
													var prox2 = moment(prox).add(15, 'days').format('YYYY-MM-DD');
													fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
													prox = prox2;
												}
												
											}else if(arrays[10]=="4"){
												
											
												var cuotaD = arrays[8].replace(".",""),
													cuotaD2 = cuotaD.replace(".",""),
													prox = moment().format('YYYY-MM-DD'),
													tiempo = arrays[4];
													
												fes.push({"cp":cuotaD2,"ct":false,"fe":prox,"pe":0});
												for(var k = 1; k < tiempo; k++){
													var prox2 = moment(prox).add(30, 'days').format('YYYY-MM-DD');
													fes.push({"cp":cuotaD2,"ct":false,"fe":prox2,"pe":0});
													prox = prox2;
												}
												
											}
											
											
											if(fes.length>0){
												
												
												var desc = parseInt(arrays[6]);
												if(desc>0){
													for(d = 0;d < desc; d++){
														fes[d].ct = true;
													}
													arrays.push(fes);
												}else{
													arrays.push(fes);
												}
												
												console.log(arrays);
												
												redisClient.keys("registry_*",function(err,cant){
													var consecutivo = cant.length + 1;
													
													/*guardo el orden segun el idasesor que tenga y guardo el contrato en un solo registro*/
																
													var oriegn = "registry_"+arrays[1]+"_contrato_"+arrays[0]+"_"+arrays[2]+"_"+consecutivo;
													
													console.log(oriegn);
													
													redisClient.set("registry_"+arrays[1]+"_contrato_"+arrays[0]+"_"+arrays[2]+"_"+consecutivo,JSON.stringify(arrays),function(err,reply) {
														
														redisClient.get("registro_contrato_"+arrays[2],function(errw,replyw) {
															if(replyw!==null){
																var esa = JSON.parse(replyw);
																esa.push(oriegn);
																redisClient.set("registro_contrato_"+arrays[2],JSON.stringify(esa),function(erwrw,repelyw) {
																	resolve([true, miEmpresa, otrasEmpresa]);
																});
															}else{
																var esa = [];
																esa.push(oriegn);
																redisClient.set("registro_contrato_"+arrays[2],JSON.stringify(esa),function(erwrw,repelyw) {
																	resolve([true, miEmpresa, otrasEmpresa]);
																});
															}
														});
														
													});
													
												});			   
												
											}else{
												reject([false,"8"]);
											}
											
										}
									});
								});

							}
						});
					
					}
					
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