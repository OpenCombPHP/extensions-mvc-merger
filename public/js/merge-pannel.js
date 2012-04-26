var MergerPannel = function()
{
	this.viewTree = null ;
}

jquery(document).ready(function (){
	var $ = jquery ;

	var mapAllFrames = {} ;
	var arrRootFrames = [] ;

	// 分析建立 frame 结构
	$('.jc-layout-frame').each(function (){

		var aFrame = {
			type : 'frame'
			, id : this.id
			, 'ele' : this
			, 'children' : []
		}
		$(this).data('object',aFrame) ;
		
		mapAllFrames[this.id] = aFrame ;

		//console.log(this.id+' closest:'+$(this).parents('.jc-layout-frame').size()) ;
		var eleParentFrame = $(this).parents('.jc-layout-frame').get(0) ;
		if( !eleParentFrame )
		{
			//console.log('root frame:'+this.id) ;
			
			arrRootFrames.push(aFrame) ;
		}
		else
		{
			//console.log(eleParentFrame.id+' <<< '+this.id) ;
			$(eleParentFrame).data('object').children.push(aFrame) ;
		}
	})
	
	// 分析视图结构
	$('.jc-view').each(function (){

		var aView = {
			type : 'view'
			, id : this.id
			, 'ele' : this
		}
		var eleParentFrame = $(this).parents('.jc-layout-frame').get(0) ;
		if( eleParentFrame )
		{
			console.log(eleParentFrame.id+' <<< '+this.id) ;
			$(eleParentFrame).data('object').children.push(aView) ;			
		}
	}) ;
	
	console.log(arrRootFrames) ;
	
})

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