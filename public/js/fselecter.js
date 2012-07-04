/*
 * A firebug like DOM selecter
 *
 * Dual licensed under the MIT and GPL licenses.
 * Copyright (c) 2012 Anubis
 * @name     fselecter
 * @author   Anubis (Kong Yuan)
 *
 */

(function($) {
	$.fn.fselecter = function(options) {
		if(!options) {
			options = {};
		}
		var settings = {};
		$.extend(settings, $.fn.fselecter.defaults, options);
		
		return $.fselecter(this, settings);
	};

	$.fselecter = function(elm, settings) {
		var e = $(elm)[0];
		return new jQuery._fselecter(e, settings);
	};

	$._fselecter = function( elm, settings ) {
		elm = $(elm);
		var paddingBlock = getHighLightBlock(
								elm.width() 
								, elm.height() 
								, settings['padding_color'] 
								, elm.css('padding-top').split('px')[0] - 0 
								, elm.css('padding-right').split('px')[0] - 0 
								, elm.css('padding-bottom').split('px')[0] - 0 
								, elm.css('padding-left').split('px')[0] - 0 
								, settings['z_index']
								);
		var marginBlock = getHighLightBlock(
								elm.outerWidth() 
								, elm.outerHeight() 
								, settings['margin_color'] 
								, elm.css('margin-top').split('px')[0] - 0 
								, elm.css('margin-right').split('px')[0] - 0 
								, elm.css('margin-bottom').split('px')[0] - 0 
								, elm.css('margin-left').split('px')[0] - 0 
								, settings['z_index']
								);
		var backgroundBlock = getHighLightBlock(
								elm.outerWidth(true) 
								, elm.outerHeight(true) 
								, settings['background_color'] 
								, elm.offset().top - (elm.css('margin-top').split('px')[0] - 0 )
								, document.body.offsetWidth - elm.offset().left - elm.outerWidth(true)
								, document.body.offsetHeight - elm.offset().top - elm.outerHeight(true)
								, elm.offset().left - (elm.css('margin-left').split('px')[0] - 0 )
								, settings['z_index']
								);
								
		//place blocks
		paddingBlock.appendTo('body').css({
			top: elm.position()['top'] 
				+ ( elm.css('margin-top').split('px')[0] - 0 ) 
				+ ( elm.css('border-top-width').split('px')[0] - 0 ) ,
			left: elm.position()['left'] 
				+ ( elm.css('margin-left').split('px')[0] - 0 ) 
				+ ( elm.css('border-left-width').split('px')[0] - 0 )
		});
		marginBlock.appendTo('body').css({
			top: elm.position()['top'],
			left: elm.position()['left']
		});
		backgroundBlock.appendTo('body').css({
			top: 0,
			left: 0
		});
	};
	
	// default options
	$.fn.fselecter.defaults = {
		z_index : 10000
		, padding_display : true
		, margin_display : true 
		, padding_color : "#C2DDB6"
		, margin_color : "#F8CB9C"
		, background_color : "#999"
	};
	
	//提供6个代表宽度的数值和一个颜色,生成显示用矩形框体
	function getHighLightBlock( width , height , color , top , right , bottom , left ,zIndex){
		var highLightBlock = $(
			  "<div class='fselecter_highlight_block' style='position:absolute;'>"
			+		"<div class='fselecter_highlight_lt fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_t fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_rt fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_l fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_r fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_lb fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_b fselecter_highlight' style='position:absolute; '></div>"
			+		"<div class='fselecter_highlight_rb fselecter_highlight' style='position:absolute; '></div>"
			+ "</div>"
			);
		
		if(arguments.length == 4){
			right = bottom = left = top;
		}else if(arguments.length == 5){
			bottom = top;
			left = right;
		}else if(arguments.length == 7){
			//do nothing
		}
		
		/* 防御 */
		if( !width || !height ){
			return highLightBlock;
		}
		top = top ? top:0;
		right = right ? right:0;
		bottom = bottom ? bottom:0;
		left = left ? left:0;
		/* 防御end */
		
		var sPrefix = 'fselecter_highlight_';
		// highLightBlock.width( left+right+width );
		// highLightBlock.height( top+height+bottom );
		
		highLightBlock.find("."+sPrefix+'lt').css({backgroundColor:color,top:0,left:0,width:left,height:top});
		highLightBlock.find("."+sPrefix+'t').css({backgroundColor:color,top:0,left:left,width:width,height:top});
		highLightBlock.find("."+sPrefix+'rt').css({backgroundColor:color,top:0,left:left+width,width:right,height:top});
		
		highLightBlock.find("."+sPrefix+'l').css({backgroundColor:color,top:top,left:0,width:left,height:height});
		highLightBlock.find("."+sPrefix+'r').css({backgroundColor:color,top:top,left:left+width,width:right,height:height});
		
		highLightBlock.find("."+sPrefix+'lb').css({backgroundColor:color,top:top+height,left:0,width:left,height:bottom});
		highLightBlock.find("."+sPrefix+'b').css({backgroundColor:color,top:top+height,left:left,width:width,height:bottom});
		highLightBlock.find("."+sPrefix+'rb').css({backgroundColor:color,top:top+height,left:left+width,width:right,height:bottom});
		
		highLightBlock.css({filter:'alpha(opacity=60)','-moz-opacity':60,opacity:'0.6'});
		
		highLightBlock.css({'z-index' : zIndex});
		
		return highLightBlock;
	}
	
	function log() {
		if( typeof console.log == 'function') {
			var sArgs = new Array();
			for(var n=0;n < arguments.length;n++){
				sArgs.push("arguments["+n+"]");
			}
			sArgs = sArgs.join(',');
			
			eval("console.log("+sArgs+")");
		}
	}

})(jQuery);
