var MergerPannel = function()
{
	this.layout = new MergerPannel.Layout ;
}
MergerPannel.prototype.init = function()
{
	var $ = jquery ;
	var thisMergerPannel = this ;
	
	var ui_dialog = $('#mergepannel-dialog').dialog({
		width: 600
		, height: 450
//		, title: "<a class='selected_mvcmerger' href='javascript:;' tab='mergepannel-layout'>视图布局</a><a href='javascript:;' tab='ub_dialog'>模板编织</a><a href='javascript:;' tab='mergepannel-controllermerger'>网页融合</a>	<a href='javascript:;' tab='mergepannel-log'>log</a>"
		, title: "<a class='selected_mvcmerger' href='javascript:;' tab='mergepannel-layout'>视图布局</a><a href='javascript:;' tab='mergepannel-controllermerger'>添加视图</a><a href='javascript:;' tab='ub_dialog'>模板编织</a>	"
		, resize: function(){ thisMergerPannel.resizeDialog() }
		, zIndex:500
		, maximize:false
		, close: function(event, ui) {
			//退出编辑模式
			location.href = location.href.split('&mvcmerger=1').join('');
		}
	}) ;
	
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
	$('.selected_mvcmerger').parent().find('a').click(function(){
		var showPage = $("#"+$(this).attr('tab'));
		if(showPage.length > 0){
			$('.mvcmerger_pages').hide();
			showPage.show();
			$('.selected_mvcmerger').removeClass("selected_mvcmerger");
			$(this).addClass("selected_mvcmerger");
		}
		return false;
	});
	
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
	
	// log
	jquery('#mergepannel-log-output').height( jquery('#mergepannel-dialog').height()-40 ) ;
	jquery('#mergepannel-log-output').width( jquery('#mergepannel-log').width() ) ;
}
