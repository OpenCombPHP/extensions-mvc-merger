jquery(function(){
	
	var $ = jquery;
	
	//编辑模式按钮,原merger-icon-menu.js内容
	$('#mvc-merger-frontframe-icon').menu({ 
		content: $('#mvc-merger-frontframe-menu').html(),
		showSpeed: 50 
	}) ;
	
	$('#ui-dialog-title-mergepannel-dialog a ').click(function(){
		alert('暂时不能使用此功能');
		return false;
	});
	
})