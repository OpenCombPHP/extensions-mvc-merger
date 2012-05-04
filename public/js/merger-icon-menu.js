jquery(function(){
	
	jquery('#mvc-merger-frontframe-icon').menu({ 
		content: jquery('#mvc-merger-frontframe-menu').html(),
		showSpeed: 50 
	}) ;
	
	jquery('#ui-dialog-title-mergepannel-dialog a ').click(function(){
		alert('暂时不能使用此功能');
		return false;
	});
})