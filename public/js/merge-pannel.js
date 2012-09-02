var MergerPannel = function()
{
	this.layout = new MergerPannel.Layout ;
}
MergerPannel.prototype.init = function()
{
	var $ = jquery ;
	var thisMergerPannel = this ;
	
	var sTitle = "<a class='selected_mvcmerger' href='javascript:;' tab='mergepannel-layout'>视图布局</a><a href='javascript:;' tab='mergepannel-controllermerger'>添加视图</a><a href='javascript:;' tab='ub_dialog'>模板编织</a>" ;
	if(bMvcMergerLog)
	{
		sTitle+= "	<a href='javascript:;' tab='mergepannel-log'>log</a>" ;
	}
	
	var ui_dialog = $('#mergepannel-dialog').wijdialog({
		width: 700
		, height: 570
		, title: sTitle
		, resize: function(){ thisMergerPannel.resizeDialog() }
		, zIndex:500
		, beforeClose: function(event, ui) {
			//退出编辑模式
			if(confirm('是否退出编辑模式?')){
			    var href = location.href.split('mvcmerger=1');
			    if(href[0].substr(-1) == '?'
			      || href[0].substr(-1) == "&"){
				href[0] = href[0].substr(0,href[0].length-1);
			    }
			    location.href = href.join("");
			}
			return false;
		},
		captionButtons: {
            pin: { visible: false },
            refresh: { visible: false },
		}
	}) ;
	
	var dialogOuter = ui_dialog.parents('.ui-dialog:first');
	dialogOuter.find('.ui-icon-carat-1-n').attr('title','折叠');
	dialogOuter.find('.ui-icon-minus').attr('title','最小化');
	dialogOuter.find('.ui-icon-extlink').attr('title','最大化');
	dialogOuter.find('.ui-icon-close').attr('title','关闭');
	
	this.layout.init() ;
	
	this.resizeDialog() ;
	
	var currHref = location.href;
	var index = currHref.lastIndexOf("?");
	var param = "";
	if(index != "-1"){    param = currHref.substr(index+1);}
	
	//获取页面融合页面内容
	$.ajax({
		url: '?c=org.opencomb.mvcmerger.merger.ControllerMerger&rspn=noframe&request='+param.replace(/&/g,'@').replace(/=/g,'^')
		, dataType:'html'
//		, beforeSend:function(){
//			comment_list_field.html('<div class="comment_loadding">加载中...</div>');
//		}
		, success: function(html) {
			$("#mergepannel-controllermerger").html(html);
			clearJCLayout();
		}
	}) ;
	
	//tab页面
	$('div.body_top_menu').find('a[tab]').click(function(){
		var showPage = $("#"+$(this).attr('tab'));
		if(showPage.length > 0){
			$('.mvcmerger_pages').hide();
			showPage.show();
//			$('.selected_mvcmerger').removeClass("selected_mvcmerger");
//			$(this).addClass("selected_mvcmerger");
			
			if($(this).attr('tab') == 'mergepannel-controllermerger' 
				&& $("#mergepannel-dialog #mergeCtl_result:visible").length == 1
			){
				$('#mergeCtl_change_panel').find('a').click();
			}
		}
		return false;
	});
	
	//body_top动态效果
	$('.body_top_down').hover(function(){
		$(".body_top").stop(false,true).slideDown();
	});
	$(".body_top").mouseleave(function(){
		if($('.body_top_pin_selected').hasClass('body_top_pin')){
			return;
		}
		$(".body_top").stop(false,true).slideUp();
	});
	
	$('.body_top_pin').click(function(){
		$('.body_top_pinnow').show().addClass('body_top_pin_selected');
		$(this).hide().removeClass('body_top_pin_selected');
	});
	$('.body_top_pinnow').click(function(){
		$('.body_top_pin').show().addClass('body_top_pin_selected');
		$(this).hide().removeClass('body_top_pin_selected');
	});
	
	function showBoxTop(){
		$(".body_top").stop(false,true).slideDown();
	}
	function hideBoxTop(){
//		if($('.body_top_pin_selected').hasClass('body_top_pin')){
//			return;
//		}
		$(".body_top").stop(false,true).slideUp();
	}
	
	
	clearJCLayout();
	//清理视图布局编辑器中的layout class 防止编辑器认错
	function clearJCLayout(){
		$('#mergepannel-dialog').find('.jc-layout').removeClass('jc-layout');
		$('#MergePannelDialog-0').removeClass('jc-layout') ;
	}
}

MergerPannel.prototype.resizeDialog = function ()
{
	// layout
	this.layout.resizeDialog();
	
	//富文本高度
	if(CKEDITOR.instances.mergeCtl_textToView_textarea !== undefined){
		var nTotalHeight = jquery('#mergepannel-dialog').height();
		nTotalHeight = nTotalHeight - 80 - 188 ; 
		jquery('#cke_contents_mergeCtl_textToView_textarea').height(nTotalHeight);
	}
	
	//模板列表高度
	if(jquery("#mergeCtl_templateTree").length !== 0){
		var nTotalHeight = jquery('#mergepannel-dialog').height();
		nTotalHeight = nTotalHeight - 188 ; 
		jquery("#mergeCtl_templateTree").height(nTotalHeight);
	}
	
	// log
	jquery('#mergepannel-log-output').height( jquery('#mergepannel-dialog').height()-40 ) ;
	jquery('#mergepannel-log-output').width( jquery('#mergepannel-log').width() ) ;
}
