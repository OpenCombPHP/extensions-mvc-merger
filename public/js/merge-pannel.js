var MergerPannel = function()
{
	this.viewTree = null ;
}

MergerPannel.prototype.init = function()
{	
	var $ = jquery ;

	$('#mergepannel-dialog').dialog() ;
		
	this._loadView($('#mergepannel-viewtree').get(0),this.viewTree) ;
	
	// 所有视图的拖拽排序
	$('.view-container').sortable({
		connectWith: '.view-container'
		, cancel: 'button'
		, sort: function(){
			//console.log('sort') ;
		}
		, remove: function(event,ui){
			console.log('remove') ;
		}
		, receive: function(event,ui){
			console.log('receive') ;
		}
	}) ;
}
MergerPannel.prototype._loadView = function(treeParentNode,viewInfo)
{
	var $ = jquery ;
	
	var ele = $('#'+viewInfo.eleId).get() ;
	var eleView = $('#mergepannel-dialog #mergepannel-viewtree-node-template').clone()
			.appendTo( $(treeParentNode) ) 
			.show()
			.data('eleId',viewInfo.eleId)
			.data('ele',ele)
			.attr('id','mergepannel-viewtree-node-'+viewInfo.id)
			
			// 绑定事件
			.mouseover(function(e){
				$($(this).data('ele')).addClass('mergepannel-view-flashing') ;
				e.stopPropagation() ;
			}) 
			.mouseout(function(){
				$($(this).data('ele')).removeClass('mergepannel-view-flashing') ;
			}) ;
	
	if(ele)
	{
		if( $(ele).hasClass('jc-view-layout-frame') )
		{
			sTitle = '框架' ;
		}
		else
		{
			sTitle = '视图';
		}
		sTitle = sTitle + ' '+viewInfo.name+'(id='+viewInfo.id+')' ;
	}
	else
	{
		sTitle = 'Missing' ;
	}
	//$sTitle = ele? jquery(ele).html(): 'Missing' ;
	//$sTitle = $sTitle + ' '+viewInfo.name+'(id='+viewInfo.id+')' ;
	eleView.find('.view-title').html(sTitle) ;
	
	if(viewInfo.children.length)
	{
		eleView.find('.children-switch').addClass( 'open' ) ;
	}
	else
	{
		eleView.find('.children-switch').addClass( 'none' ).html('+') ;
	}
	
	for(var i in viewInfo.children)
	{
		this._loadView(eleView.find('.view-container').get(0),viewInfo.children[i])
	}
}

MergerPannel.childrenSwitch = function (eleSwitch)
{
	jquery(eleSwitch).closest('.mergepannel-viewtree-node').children('.view-container').toggle() ;
	
	if(jquery(eleSwitch).hasClass('open'))
	{
		jquery(eleSwitch).removeClass('open') ;
		jquery(eleSwitch).addClass('close') ;
	}
	else if(jquery(eleSwitch).hasClass('close'))
	{
		jquery(eleSwitch).addClass('open') ;
		jquery(eleSwitch).removeClass('close') ;
	}
}
MergerPannel.closeChildren = function (eleSwitch)
{
	jquery(eleSwitch).closest('.mergepannel-viewtree-node').children('.view-container').hide() ;
	jquery(eleSwitch).addClass('close') ;
	jquery(eleSwitch).removeClass('open') ;
}