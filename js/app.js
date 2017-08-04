jQuery(document).ready(function($) {


	// 1o passo do documento: Injetar os SVGs atraves de ajax.
	var SvgsParaInjetar = $('img.injetar');
	SvgsParaInjetar.each(function(index, el) {
		var i = index;
		SVGInjector($(el), {}, function(){
			if (i+1 === SvgsParaInjetar.length) {
			
				// 2o passo: depois de carregar SVGs, comecar o material.
				comecar();
			}
		});
	});

	var comecar = function(){

		//deixando o body visivel.
		var corpo = $('body');
		corpo.addClass('visivel');

		// videos de libras

		var videosLibras = $('.libras');

		videosLibras.each(function(index, el) {
			var video = $(el).find('video');
			var progresso = $(el).find('svg > circle.progresso');
			var buttons = $(el).find('button');
			var btplaypause = $(el).find('button.btplaypause');			
			var btreset = $(el).find('button.btreset');
			var perimetroProgresso = parseFloat( progresso.attr('r') )*2*Math.PI;
			var attProgresso;
			var videoEstaRodando = false;
			var temHover = true;
			progresso.css({
				'stroke-dasharray' : perimetroProgresso,
				'stroke-dashoffset' : perimetroProgresso,
			});

			var atualizarProgresso = function(){
				var fillProgresso = perimetroProgresso - (( video[0].currentTime/video[0].duration ) * perimetroProgresso);
  				progresso.css('stroke-dashoffset', fillProgresso);
  				attProgresso = requestAnimationFrame(atualizarProgresso);
  				if (video[0].currentTime/video[0].duration >= 0.9999) {
	  				progresso.css('stroke-dashoffset', perimetroProgresso);
	  				cancelAnimationFrame(attProgresso);
					$(el).attr({
						'data-playing': 'false',
						'data-resetavel': 'false'
					});
	  				videoEstaRodando = false;
  				}
			}

			// buttons.on('focus blur', function(event) {
				
			// 	/* Act on the event */
			// });

			btplaypause.on('click', function(event) {
				if (videoEstaRodando === false) {
					video[0].play();
					attProgresso = requestAnimationFrame(atualizarProgresso);
					$(el).attr({
						'data-playing': 'true',
						'data-resetavel': 'true'
					});
					$(this).attr('title', $(this).attr('data-title-pause'));
					temHover = false;
					videoEstaRodando = true;
				} else if (videoEstaRodando === true) {
					video[0].pause();
					$(el).attr('data-playing', 'false');
					cancelAnimationFrame(attProgresso);
					$(this).attr('title', $(this).attr('data-title-play'));
					videoEstaRodando = false;
				}
			});

			$(el).find('.cont-video').on('mousemove', function(event) {
				if (!temHover) {
					temHover = true;
					setTimeout(function(){ 
						$(el).addClass('hover');
					},400);
					
				}
			})


			btreset.on('click', function(event) {
				video[0].pause();
				video[0].currentTime = 0;
				progresso.css({
					'stroke-dasharray' : perimetroProgresso,
					'stroke-dashoffset' : perimetroProgresso,
				});
				$(el).attr({
						'data-playing': 'false',
						'data-resetavel': 'false'
					});
				videoEstaRodando = false;
				/* Act on the event */
			});



		});

		// Interatividade do mapa

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

		//Fazendo o select dos tipos de usuario mudarem os dados da tabela. 
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

		

		// botao ficha tecnica revela a ficha tecnica e rola para ela.
		var btfichatecnica = $('footer button.fichatecnica');
		var fichatecnica = $('#fichatecnica');

		btfichatecnica.on('click', function(event) {
			$('footer').attr('aria-live', 'polite');
			fichatecnica.addClass('db');
			$('body').stop().animate({'scrollTop':  (
						$('footer').offset().top > $('body').height() - $(window).height()
						? $('body').height() - $(window).height()
						: $('footer').offset().top

				)}, 600);
			/* Act on the event */
		});


		// Metodo para gerar as perguntas


		var numeroPerguntas = 4; // # de perguntas que o usuário deve responder.
		var data_perguntas; // var que armazena os dados de todas as perguntas. É 'populado' por Ajax.
		var secaoPerguntas = $('#s11 .content');

		var storePerguntasEscolhidas = []; //Array que armazena o numero das perguntas que já foram escolhidas, para evitar repetição e calcular se ainda é possível gerar novas perguntas caso o usuário tenha vontade de responder o questionario novamente.
		var daPraGerarMaisPerguntas = true; // Muda de valor quando nao sobraram perguntas o suficiente para gerar um novo questionario, e impede o geramento.

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

			var totalPerguntas = data_perguntas.length;
			var nAleatorios = [];
			while(nAleatorios.length < numeroPerguntas){
				var randomnumber = Math.floor(Math.random()*totalPerguntas);
			    if(nAleatorios.indexOf(randomnumber) > -1 || storePerguntasEscolhidas.indexOf(randomnumber) > -1) continue;
			    nAleatorios.push(randomnumber);
			    storePerguntasEscolhidas.push(randomnumber);
			}

			if (totalPerguntas - storePerguntasEscolhidas.length < numeroPerguntas ) {
				console.log('Faltam',totalPerguntas - storePerguntasEscolhidas.length, 'perguntas, precisava de', numeroPerguntas, 'para gerar mais um quiz');
				daPraGerarMaisPerguntas = false;
			}

			for (var i = 0; i < numeroPerguntas; i++) {
				var perguntaClone = templatePergunta.clone();
				var perguntaDaLista = data_perguntas[nAleatorios[i]];
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

		// metodo que aplica toda a funcionalidade das perguntas
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
						$('body').stop().animate({'scrollTop': (
							$('#s12').offset().top > $('body').height() - $(window).height() ?
							$('body').height() - $(window).height() :
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
					$('body').stop().animate({'scrollTop': (
						perguntaRelevada.find('h3').offset().top > $('body').height() - $(window).height() ?
						$('body').height() - $(window).height() :
						perguntaRelevada.find('h3').offset().top 
						) }, 400);
						
					}
				});
			});

		}


		// solicitação AJAX das perguntas. Ao carregar, chamar todas as funções relativas às perguntas.
		$.ajax({
			url: 'js/perguntas.json',
			type: 'GET',
			dataType: 'json'
		})
		.done(function(data) {
			data_perguntas = data;
			gerarPerguntas();
			funcionamentoPerguntas();
		});

		// Botão que refaz as perguntas
		var botaoRetry = $('#retryquiz');
		botaoRetry.on('click', function(event) {
			var bt = $(this);
			$('body').animate({'scrollTop': ($('#s10').offset().top) }, 1000, function(){
				bt.closest()
				$('#s11').find('.pergunta').remove();
				$('#s12').find('.states').addClass('invisivel').find('.texto > p').removeClass('invisivel');
				gerarPerguntas();
				funcionamentoPerguntas();
				// console.log(storePerguntasEscolhidas);
			});
			
		});
		
	}
});