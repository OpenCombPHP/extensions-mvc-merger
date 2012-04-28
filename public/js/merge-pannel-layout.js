MergerPannel.Layout = function ()
{
	this.mappingItemElements = {} ;
	this.arrZTreeRootNodes = [] ;
}


MergerPannel.Layout.prototype.init = function()
{
	var $ = jquery ;
	var thisMergerPannelLayout = this ;
	
	this.scanFrameViewStruct() ;
	console.log(this.arrZTreeRootNodes) ;

	this.aZtree = $.fn.zTree.init($('#mergepannel-viewtree'),{
			view: {
				showLine: true
				, selectedMulti: false
				, dblClickExpand: true
				, nameIsHTML: true 
				, expandSpeed: 0
			}
			, edit : {
				enable : true
				, showRemoveBtn : false
				, showRenameBtn : false
				, drag : {
					isMove : true
					, prev : true
					, next : true
					, inner : true
				}
			}
			, callback: {
				beforeDrop: function (treeId,treeNodes,targetNode,moveType) {
					console.log(moveType) ;
					// 移动到目标的 前/后，需要判断目标的上级是否是一个 frame
					if( moveType=='prev' || moveType=='next' )
					{
						return targetNode.inframe ;
					}
					// 移动到目标的内部，判断目标本身是否是一个 frame
					else if( moveType=='inner' )
					{
						return targetNode.type!=='view' ;
					}
					else
					{
						// what wrong !?
					}
					return false ;
				}
				, beforeDrag: function(treeId, treeNodes) {
					for (var i=0,l=treeNodes.length; i<l; i++) {
						if (treeNodes[i].inframe === false) {
							return false;
						}
					}
					return true;
				}
				, onDrag: function(event, treeId, treeNodes) {
				}
				, onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
				}
			}
	}, this.arrZTreeRootNodes) ;
	
	// 全部展开
	this.aZtree.expandAll(true) ;
	
	// 加载样式
	$('li[treenode]').each(function(){

		var aTreeNode = thisMergerPannelLayout.aZtree.getNodeByTId(this.id) ;
		$('#'+aTreeNode.tId).find('span').addClass( 'mergepannel-viewtree-item-draggable' ) ;
	}) ;
}



MergerPannel.Layout.prototype.displayDroppingTip = function (sText){

	jquery('#mergepannel-viewtree-dropping-tip').show().animate({
		left: window.event.x + 30
		,top: window.event.y
	}).html(sText) ;
	
}
MergerPannel.Layout.prototype.scanFrameViewStruct = function (){
	var $ = jquery ;
	var thisMergerPannelLayout = this ;

	this.mappingItemElements = {} ;
	this.arrZTreeRootNodes = [] ;

	// 分析建立 frame/view 结构
	$('.jc-layout').each(function ()
	{
		var inframe = $(this.parentNode).hasClass('jc-frame') ;		
		var sType = $(this).hasClass('jc-view')? 'view': 'frame' ;
		
		var aLayoutItem = {
			name : this.id
			, icon: sMvcMergerPublicFolderUrl+'/'+sType+'.png'
			, children : []
			, drop: sType=='frame'
			, drag: true
			
			, type : sType
			, id : this.id
			, inframe: inframe
		}
		$(this).data('object',aLayoutItem) ;

		thisMergerPannelLayout.mappingItemElements[this.id] = this ;
		
		var eleParentFrame = $(this).parents('.jc-layout').get(0) ;
		if( !eleParentFrame )
		{
			thisMergerPannelLayout.arrZTreeRootNodes.push(aLayoutItem) ;
		}
		else
		{
			$(eleParentFrame).data('object').children.push(aLayoutItem) ;
		}
	})	
}

MergerPannel.Layout.prototype.resizeDialog = function ()
{
	var $ = jquery ;
	$('#mergepannel-viewtree').height(
			$('#mergepannel-dialog').height() - $('#mergepannel-layout-struct-title').height()
	) ;
	$('#mergepannel-layout-struct').width(
			$('#mergepannel-dialog').width() - $('#mergepannel-properties').width() - 20
	) ;
}

MergerPannel.Layout.prototype.openProperty = function(liItem)
{
	var $ = jquery ;
	
	// 设置选中状态
	
	
	$('#mergepannel-props-id').html($(liItem).data('eleId')) ;
	
	// frame
	if( $(liItem).data('object').type == 'frame' )
	{
		$('#mergepannel-props-type').html('框架') ;
		$('#mergepannel-props-frame-type').show() ;
	}
	else
	{
		$('#mergepannel-props-type').html('视图') ;
		$('#mergepannel-props-frame-type').hide() ;
	}
}