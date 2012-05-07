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
		, title: "<a href='javascript:void'>视图布局</a> | <a href='javascript:void'>模板编织</a> | <a href='javascript:void'>网页融合</a>"
		, resize: function(){ thisMergerPannel.resizeDialog() }
		, zIndex:500
	}) ;
	
	this.layout.init() ;

	
	this.resizeDialog() ;
}

MergerPannel.prototype.resizeDialog = function ()
{
	this.layout.resizeDialog();
}