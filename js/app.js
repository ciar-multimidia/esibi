jQuery(document).ready(function($) {


	var comecar = function(){


		var corpo = $('body');
		var janelaECorpo = $('html, body');







		// @@@@@@ VIDEOS DE LIBRAS @@@@@@

		var videosLibras = $('.libras');

		videosLibras.each(function(index, el) {
			var essaLibras = $(el);
			var video = $(el).find('video');
			var progresso = $(el).find('svg > circle.progresso');
			var buttons = $(el).find('button');
			var btplaypause = $(el).find('button.btplaypause');			
			var btreset = $(el).find('button.btreset');
			var perimetroProgresso = parseFloat( progresso.attr('r') )*2*Math.PI;
			var attProgresso;
			var videoEstaRodando = false;
			progresso.css({
				'stroke-dasharray' : perimetroProgresso,
				'stroke-dashoffset' : perimetroProgresso,
			});


			var atualizarProgresso = function(){
				var fillProgresso = perimetroProgresso - (( video[0].currentTime/video[0].duration ) * perimetroProgresso);
  				progresso.css('stroke-dashoffset', fillProgresso);
  				attProgresso = requestAnimationFrame(atualizarProgresso);
			}

			video.on('loadeddata', function(event){
				essaLibras.addClass('loaded');
			});

			if (video[0].duration > 0) {
				essaLibras.addClass('loaded');
			}

			video.on('waiting', function(event) {
				essaLibras.addClass('buffering');
				/* Act on the event */
			});

			video.on('canplay', function(event) {
				essaLibras.removeClass('buffering');
			});

			video.on('pause', function(event) {
				essaLibras.removeClass('playing');
				cancelAnimationFrame(attProgresso);

			});

			video.on('playing', function(event) {
				essaLibras.addClass('playing canreset');
				attProgresso = requestAnimationFrame(atualizarProgresso);
				
			});

			video.on('ended', function(event) {
				video[0].pause();
  				progresso.css('stroke-dashoffset', perimetroProgresso);
  				cancelAnimationFrame(attProgresso);
				essaLibras.removeClass('playing buffering canreset');
  				videoEstaRodando = false;
			});

			
			// buttons.on('focus blur', function(event) {
				
			// 	/* Act on the event */
			// });

			btplaypause.on('click', function(event) {
				if (videoEstaRodando === false) {
					video[0].play();
					$(this).attr('title', $(this).attr('data-title-pause'));
					videoEstaRodando = true;
				} else if (videoEstaRodando === true) {
					video[0].pause();
					$(this).attr('title', $(this).attr('data-title-play'));
					videoEstaRodando = false;
				}
			});


			btreset.on('click', function(event) {
				video[0].pause();
				video[0].currentTime = 0;
  				progresso.css('stroke-dashoffset', perimetroProgresso);
  				cancelAnimationFrame(attProgresso);
				essaLibras.removeClass('playing buffering canreset');
				videoEstaRodando = false;
				/* Act on the event */
			});



		});








		// @@@@@@ INTERATIVIDADE DO MAPA @@@@@@


		var listaCidades = $('#mapa-interativo .cidades > div');
		var containerMapa = $('#mapa-interativo .container-mapa');
		var marcadoresMapa = containerMapa.find('div.marcador');

		listaCidades.on('mouseenter mouseleave', function(event) {
			var datacidade = $(this).attr('data-cidade');
			marcadoresMapa.filter('[data-cidade=\''+datacidade+'\']').toggleClass('destaque');
		});

		marcadoresMapa.on('mouseenter mouseleave', function(event) {
			var datacidade = $(this).attr('data-cidade');
			listaCidades.not('[data-cidade=\''+datacidade+'\']').toggleClass('ocultar');
			listaCidades.filter('[data-cidade=\''+datacidade+'\']').toggleClass('destaque');
		});










		// @@@@@@ FAZENDO O SELECT DOS TIPOS DE USUARIO MUDAREM OS DADOS DA TABELA @@@@@@

		var tiposDeUsuario = $('#tiposDeUsuario');
		var tabelaPrazosQtdes = $('#prazosQtdes');

		var atualizarTabela = function(){
			
			var linhasTabela = tabelaPrazosQtdes.find('tbody > tr');
			var selecionado = tiposDeUsuario.find('option:selected');
			linhasTabela
				.css( { 'display': '' } )
				.find('td')
				.css('opacity', '0')
				.stop();

			linhasTabela.each(function(index, el) {
				var dataNaoTem = $(el).attr('data-naotem');
				if (dataNaoTem) {
					var valoresNaoTem = dataNaoTem.split(' ');

					$.each(valoresNaoTem, function(index2, val2) {
						if ( parseInt(val2)-1 === selecionado.index() ) {
							$(el).css('display', 'none');
						}
					});
				} else{
					$(el).css('display', '');
				}

				var intervaloAnim = 50;
				var tempoAnim = 300;
				$(el).children('td').each(function(index2, el2) {
					if (index2 > 0) {
						$(el2)
							.find('span')
							.css('display', 'none')
							.eq(selecionado.index())
							.css('display', '');
					}

					setTimeout(
						function(){
							$(el2).stop().animate({'opacity': '1'}, tempoAnim);
						},
						intervaloAnim*index2 + intervaloAnim*index
					);
				});
			});
		}

		atualizarTabela();
		tiposDeUsuario.on('change', atualizarTabela);

		





		// @@@@@@ BOTAO FICHA TECNICA REVELA A FICHA TECNICA E ROLA PARA ELA @@@@@@

		var btfichatecnica = $('footer button.fichatecnica');
		var fichatecnica = $('#fichatecnica');

		btfichatecnica.on('click', function(event) {
			$('footer').attr('aria-live', 'polite');
			fichatecnica.addClass('db');
			janelaECorpo.stop().animate({'scrollTop':  (
						$('footer').offset().top > corpo.height() - $(window).height()
						? corpo.height() - $(window).height()
						: $('footer').offset().top

				)}, 600);
			/* Act on the event */
		});






		// @@@@@@ CRIACAO DE PERGUNTAS @@@@@@

		var numeroPerguntas = 4; // numero de perguntas que o usuário deve responder.
		var dataPerguntas = data_perguntas; // var que armazena os dados de todas as perguntas. Está num arquivo JS externo.
		var secaoPerguntas = $('#s11 .content');

		var storePerguntasEscolhidas = []; //Array que armazena o numero das perguntas que já foram escolhidas, para evitar repetição e calcular se ainda é possível gerar novas perguntas caso o usuário escolha responder o questionario novamente.
		var daPraGerarMaisPerguntas = true; // Muda para 'false' quando nao sobraram perguntas o suficiente para gerar um novo questionario, e impede o geramento.

		// Metodo que gera as perguntas novas.
		var gerarPerguntas = function(){

			var templatePergunta = $('\
					<div class=\'pergunta\'>\
                        <h3 class=\'numero-pergunta\'></h3>\
                        <fieldset class=\'box-pergunta\'>\
                            <p class="legenda"></p>\
                            <ul class=\'lista-alternativas\'></ul>\
                            <div class=\'container-botao\'>\
		                        <button class=\'confirmar\' disabled>Confirmar escolhas</button>\
                            </div>\
                            <div class=\'container-auxiliar container-botao\'>\
	                            <p></p>\
	                            <button class=\'prox-pergunta\'>Próxima pergunta</button>\
                            </div>\
                        </fieldset>\
                    </div>\
				');

			var templateOpcao = $('\
					<li>\
						<input type=\'checkbox\' name=\'\' id=\'\'>\
						<label for=\'\'>\
						</label>\
					</li>\
				');

			var totalPerguntas = dataPerguntas.length;
			var nAleatorios = [];
			while(nAleatorios.length < numeroPerguntas){
				var randomnumber = Math.floor(Math.random()*totalPerguntas);
			    if(nAleatorios.indexOf(randomnumber) > -1 || storePerguntasEscolhidas.indexOf(randomnumber) > -1) continue;
			    nAleatorios.push(randomnumber);
			    storePerguntasEscolhidas.push(randomnumber);
			}

			if (totalPerguntas - storePerguntasEscolhidas.length < numeroPerguntas ) {
				// console.log('Faltam',totalPerguntas - storePerguntasEscolhidas.length, 'perguntas, precisava de', numeroPerguntas, 'para gerar mais um quiz');
				daPraGerarMaisPerguntas = false;
			}

			for (var i = 0; i < numeroPerguntas; i++) {
				var perguntaClone = templatePergunta.clone();
				var perguntaDaLista = dataPerguntas[nAleatorios[i]];
				var alternativas = [];

				$.each(perguntaDaLista.alternativas, function(index, val) {
					var altClone = templateOpcao.clone();
					altClone
						.attr('data-estacorreto', val.esta_correta)
						.find('input')
						.attr({
							'name': ('pergunta'+(i+1)),
							'id': ('pergunta'+(i+1)+'opcao'+(index+1))
						});
						

					altClone
						.find('label')
						.attr('for', ('pergunta'+(i+1)+'opcao'+(index+1)) )
						.html('<span class=\'custominput\'><img src="img/'+(val.esta_correta ? 'acertou' : 'errou')+'.svg" alt="Alternativa '+(val.esta_correta ? 'correta' : 'incorreta')+'" class="certo-errado" /></span><span class=\'texto-alt\'>'+val.texto+'</span>');

					perguntaClone.find('ul.lista-alternativas').append(altClone);

				});

				if (i === numeroPerguntas-1) {
					perguntaClone.find('.prox-pergunta').text('Finalizar questionário');
				}

				perguntaClone
					.find('h3.numero-pergunta')
					.html('<span class=\'apenas-screen-reader\'>Pergunta número</span>'+(i+1)+'<span class=\'apenas-screen-reader\'> de '+numeroPerguntas+'</span>' )
					.end()
					.find('p.legenda')
					.text(perguntaDaLista.enunciado)
					.end()
					.find('.container-auxiliar p')
					.text(perguntaDaLista.texto_auxiliar)
					.end()
					.appendTo(secaoPerguntas);
			}

			secaoPerguntas = $('#s11 .content');
			secaoPerguntas.find('.pergunta').eq(0).addClass('db');
			setTimeout(function(){
				secaoPerguntas.find('.pergunta').eq(0)
					.addClass('visivel')
					.find('.box-pergunta')
					.addClass('visivel');
			},20);
			

		}





		// @@@@@@ METODO QUE APLICA TODA A FUNCIONALIDADE DAS PERGUNTAS @@@@@@

		var funcionamentoPerguntas = function(){
			secaoPerguntas = $('#s11 .content');
			var perguntasDom = secaoPerguntas.find('.pergunta');
			
			perguntasDom.each(function(index, el) {
				
				$(el).find('input').on('change', function(event) {
					
					if ($(el).find('input:checked').length > 0) {
						$(el).find('button.confirmar').removeAttr('disabled');
					} else{
						$(el).find('button.confirmar').attr('disabled', 'true');
					}
				});	

				$(el).find('button.confirmar').on('click', function(event) {

					$(el).attr('aria-live', 'polite');

					if (!$(this).attr('disabled')) {
						$(el).find('.container-auxiliar').addClass('db');
						setTimeout(function(){
							$(el).find('.container-auxiliar').addClass('visivel');
						},20);

						$(this).parent().remove();


						$(el).find('li').addClass('confirmado').find('input').attr('disabled', 'disabled');
						// $(el).find('input:checked').parent().find('img.certo-errado').addClass('visivel');
					}

				});

				$(el).find('button.prox-pergunta').on('click', function(event) {
					$(this).remove();
					if (index+1 === numeroPerguntas) {
						$('#s12, #s13, footer').addClass('db');
						janelaECorpo.stop().animate({'scrollTop': (
							$('#s12').offset().top > corpo.height() - $(window).height() ?
							corpo.height() - $(window).height() :
							$('#s12').offset().top
							) }, 1000);
						if (daPraGerarMaisPerguntas === true) {
							$('#s12').find('.states').removeClass('invisivel').find('.texto > p').eq(1).addClass('invisivel');
						} else{
							$('#s12').find('.states').removeClass('invisivel').find('.texto > p').eq(0).addClass('invisivel').end();
							$('#retryquiz').addClass('invisivel').off();

						}
					}else{
						var perguntaRelevada = perguntasDom.eq(index+1);
						perguntaRelevada.addClass('db');
						setTimeout(function(){
							perguntaRelevada
								.addClass('visivel')
								.find('.box-pergunta')
								.addClass('visivel');
						},20);
					janelaECorpo.stop().animate({'scrollTop': (
						perguntaRelevada.find('h3').offset().top > corpo.height() - $(window).height() ?
						corpo.height() - $(window).height() :
						perguntaRelevada.find('h3').offset().top 
						) }, 400);
						
					}
				});
			});

		}

		gerarPerguntas();
		funcionamentoPerguntas();






		// @@@@@@ BOTÃO QUE REFAZ AS PERGUNTAS @@@@@@

		var botaoRetry = $('#retryquiz');
		botaoRetry.on('click', function(event) {
			var bt = $(this);
			janelaECorpo.animate({'scrollTop': ($('#s10').offset().top) }, 1000, function(){
				if (janelaECorpo.index($(this)) == janelaECorpo.length-1) {
					$('#s11').find('.pergunta').remove();
					$('#s12').find('.states').addClass('invisivel').find('.texto > p').removeClass('invisivel');
					gerarPerguntas();
					funcionamentoPerguntas();
				}
			});
			
		});






		// @@@@@@ FUNCIONALIDADE PARA CONCLUSÃO DO CURSO @@@@@@

		var $btConcluir = $('#fim-treinamento'); // botão de conclusão
		var $pMsgProcessando = $('.msgs-fim > .processando'); // mensagem indicando que está sendo processado o pedido
		var $pMsgFinal = $('.msgs-fim > .msgfinal'); // tag p que conterá a mensagem final, indicando o resultado do ajax.
		var $linkVoltarPortal = $('.msgs-fim > .link-voltar-portal'); // Link que volta para o Portal.


		var urlConclusao = 'test.txt'; // É aqui que ficará armazenado a URL que será consultada para concluir o curso.
		var tempoMinAnimLoading = 2000 // Tempo mínimo para a animação de loading ocorrer. 2000 = 2 segundos.
		var titleOriginalBt = $btConcluir.attr('title'); // Armazenando title original do botao



		// Objeto contendo todas as mengagens. As mensagens de sucesso e erro são padrões e devem existir. Caso existam situações que exijam outras mensagens, fica a vontade para acrescentar mais.
		var msgsPossiveis = {
			sucesso: 'Sucesso! Você pode agora se cadastrar no Sistema de Bibliotecas da UFG.',
			erro: 'Um problema técnico impediu a validação.<br>Verifique sua conexão com a internet e tente novamente, ou entre em contato com o Cercomp.',
			impedido: 'Alguma pendência com a UFG está impedindo a validação do seu curso. <br>Entre em contato com a Biblioteca para mais informações.'
		}


		
		// Toda a chamada Ajax está dentro do evento de clicar no botão, mesmo. 
		$btConcluir.on('click', function(event) {

			var $thisBt = $(this);
			var tempoAntesClicar = new Date().getTime(); // serve para calcular quanto tempo o ajax levou.
			var msgFinal = ''; // Armazena a chave do objeto contendo as msgs possiveis.
			$pMsgProcessando.addClass('ativo');
			$pMsgFinal.removeClass('ativo aviso');
			$linkVoltarPortal.removeClass('ativo');
			
			$thisBt
			.attr({'disabled': 'disabled','title': 'Processando validação'}).addClass('loading'); // Ativa a animação de loading

			// ajax
			var ajaxConclusao = $.ajax({
				url: urlConclusao,
				type: 'GET'
			})

			// Esse é o método chamado caso a solicitação AJAX funcione. 
			// 'data' é a variavel que armazena o que foi baixado pelo AJAX. Aqui no meu exemplo, é um txt, entao o 'data' tem um mero valor de string
			// Eu não sei se existem condições que impeça o usuário de finalizar o curso. Caso exista, é só re-escrever esse .done de acordo. Eu já escrevi um exemplo abaixo.
			.done(function(data) {
				if (data === 'Sucesso') {
					msgFinal = 'sucesso';
				}else {
					msgFinal = 'impedido';
				}
			})


			// 'fail' é APENAS falha no ajax. Nao tem NADA a ver com 
			.fail(function(data) {
				usuarioPodeTentarDeNovo = true;
				msgFinal = 'erro';
			})
			.always(function() {
				// Existe um tempo mínimo que a animação de "loading" vai acontecer, independente de quanto tempo o Ajax levar. Isso acontecerá por motivos de usabilidade, mesmo. A variavel logo abaixo e o Timeout no final já faz todas as contas para garantir esse tempo minimo.
				var tempoAnimFinal = tempoMinAnimLoading - (new Date().getTime() - tempoAntesClicar); 
				var timeoutFimAnim = setTimeout(function(){
					
					$thisBt.removeClass('loading').attr('title', titleOriginalBt);

					if (msgFinal === 'sucesso') {
						$thisBt.addClass('done').attr('title', 'Você concluiu o curso!');
					} 

					else if (msgFinal === 'impedido'){
						$pMsgFinal.addClass('aviso');
					} 

					else if (msgFinal === 'erro') {
						$thisBt.removeAttr('disabled');
						$pMsgFinal.addClass('aviso');
					}

					$pMsgProcessando.removeClass('ativo');
					$pMsgFinal.html(msgsPossiveis[msgFinal]).addClass('ativo');
					$linkVoltarPortal.addClass('ativo');
				}, (tempoAnimFinal > 0 ? tempoAnimFinal : 0) );
			});
			
		});
	}

	comecar();
});