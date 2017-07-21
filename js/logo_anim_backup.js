jQuery(document).ready(function($) {
	// Se o usuário já visitou essa pagina antes ou esta tentando recarregar a página (o que pode guardar a posição do scroll), zera a posição do scroll
	var corpotodo = $('html, body');
	corpotodo.scrollTop(0);
	corpotodo.addClass('blockscroll')

	// 1o passo do documento: Injetar os SVGs atraves de ajax.
	var SvgsParaInjetar = $('img.injetar');
	SvgsParaInjetar.each(function(index, el) {
		var i = index;
		SVGInjector($(el), {}, function(){
			if (i == SvgsParaInjetar.length-1) {
				comecarAnimacao();
			}
		});
	});
	

	comecarAnimacao = function(){

			// 2o passo: apos injetados, animar o logo na intro.
			var logo = new Object;
			logo.dom = $('svg#logointro');
			logo.imago = logo.dom.children('g.imago');
			var intervaloAnim = 200;
			var intervaloLetras = 20;

			// separar cada letra do titulo em spans
			var titulointro = $('#titulointro');
			titulointro.children().each(function(index, el) {
				var htmlEl = $(el).html().split('');

				var passandoPorTag = false;
				var htmlFinal = [];

				$.each(htmlEl, function(index2, val2) {

					if (val2 === "<") {
						passandoPorTag = true;
						htmlFinal.push(val2);
					} else if (passandoPorTag === true) {
						htmlFinal[htmlFinal.length-1] = htmlFinal[htmlFinal.length-1]+val2;						
						if (val2 === '>') {
							passandoPorTag = false;
						}
					} else{
						htmlFinal.push('<span>'+val2+'</span>');
					}

				});

				htmlFinal = $.parseHTML( htmlFinal.join('') ); 
				$(el).html(htmlFinal);
			});



			var titulointro = $('#titulointro');
			titulointro.css('opacity', 1);
			var tituloIntroSpans = $('#titulointro > * > span');


			logo.imago.children().each(function(index, el) {

				var lengthStroke = (function(){
					if ($(el).is('circle')) {
						return(
							parseFloat( $(el).attr('r') )*2*Math.PI
						);
					}

					else if ($(el).is('rect')) {
						return(
							parseFloat( $(el).attr('width') )*2 +
							parseFloat( $(el).attr('height') )*2 +
							($(el).attr('rx') != undefined
								? parseFloat( $(el).attr('rx') )*2*Math.PI - parseFloat( $(el).attr('rx') )*8
								: 0
							)
						);
					}
				})();
				lengthStroke = ( Math.round(lengthStroke*100) )/100;
				
				$(el).css({
					'stroke-dasharray': lengthStroke,
					'stroke-dashoffset': lengthStroke
				});

				var elImago = $(el);
				var indexImago = index;

				setTimeout(function(){
					elImago.animate({'stroke-dashoffset': 0}, 1200, function(){
						if (indexImago == logo.imago.children().length-1) {
							logo.imago.children().addClass('visivel');
							tituloIntroSpans.each(function(index, el) {
								setTimeout(function(){
									$(el).addClass('visivel');
									if (index === tituloIntroSpans.length-1) {
										corpotodo.removeClass('blockscroll');
										$('#s1').addClass('pronto');
									}
								}, intervaloLetras*index);
							});
							
						}
					});
				}, intervaloAnim*indexImago);

				
			});
		}
});