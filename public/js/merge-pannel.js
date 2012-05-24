var MergerPannel = function()
{
	this.layout = new MergerPannel.Layout ;
}

MergerPannel.prototype.init = function()
{
	var $ = jquery ;
	var thisMergerPannel = this ;
	
	$('#mergepannel-dialog').dialog({
		width: 600
		, height: 450
		, title: "<a class='selected_mvcmerger' href='javascript:;' tab='mergepannel-layout'>视图布局</a><a href='javascript:;' tab='ub_dialog'>模板编织</a><a href='javascript:;' tab='mergepannel-controllermerger'>网页融合</a>"
		, resize: function(){ thisMergerPannel.resizeDialog() }
		, zIndex:500
	}) ;
	
	this.layout.init() ;
	
	this.resizeDialog() ;
	
	//获取页面融合页面内容
	$.ajax({
		url: '?c=org.opencomb.mvcmerger.merger.ControllerMerger&rspn=noframe'
		, dataType:'html'
//		, beforeSend:function(){
//			comment_list_field.html('<div class="comment_loadding">加载中...</div>');
//		}
		, success: function(html) {
			$("#mergepannel-controllermerger").html(html);
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
}

MergerPannel.prototype.resizeDialog = function ()
{
	this.layout.resizeDialog();
}