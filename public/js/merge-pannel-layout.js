MergerPannel.Layout = function ()
{
	this.arrZTreeRootNodes = [] ;
	this.aZtree = [] ;
	
	this.eleSelectedItem = null ;
	this.dataSelectedItem = null ;
	
	// 单件
	MergerPannel.Layout.singleton = this ;
}


MergerPannel.Layout.prototype.init = function()
{
	var $ = jquery ;
	var realThis = this ;
	
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
				//
				onMouseUp: function(event,treeId,treeNode) {
					
				}
				//
				, onMouseDown: function(event,treeId,treeNode) {
					
				}
				
				// 判断是否允许拖动
				, beforeDrag: function(treeId, treeNodes) {
					for (var i=0,l=treeNodes.length; i<l; i++) {
						if (treeNodes[i].inframe === false) {
							return false;
						}
					}
					return true;
				}
				
				// 判断是否允许放置
				, beforeDrop: function (treeId,treeNodes,targetNode,moveType) {
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
				
				// 放置事件
				, onDrop: function(event, treeId, treeNodes, targetNode, moveType) {
					for(var i in treeNodes)
					{
						var eleView = document.getElementById(treeNodes[i].id) ;
						var eleTargetItem = document.getElementById(targetNode.id) ;
						
						if(moveType=='prev')
						{
							realThis.moveBefore( eleView, eleTargetItem ) ;
						}
						else if(moveType=='next')
						{
							realThis.moveAfter( eleView, eleTargetItem ) ;
						}
						else if(moveType=='inner')
						{
							realThis.moveIn( eleView, eleTargetItem ) ;
						}
					}
				}
			
				// 点击 frame/view ，打开旁边的属性界面
				, onClick: function(event, treeId, treeNode) {
					realThis.eleSelectedItem = document.getElementById(treeNode.id) ;
					realThis.dataSelectedItem = treeNode ;
					realThis.openProperty( treeNode, realThis.eleSelectedItem ) ;
				}
			}
	}, this.arrZTreeRootNodes) ;
	
	// 全部展开
	this.aZtree.expandAll(true) ;
		
	$('li[treenode]>a>span')
		// 添加样式
		.addClass( 'mergepannel-viewtree-item-draggable' ) 
		// 补充 zTree 的事件
		.mouseover( function(){
			// 鼠标移过 item 时， 对应的 frame/view 闪烁样式
			var aNode = realThis.aZtree.getNodeByTId(this.parentNode.parentNode.id) ;
			$('#'+aNode.id).addClass('mergepannel-layout-'+aNode.type+'-flashing') ;
		})
		.mouseout( function(){
			// 取消 item 对应的 frame/view 闪烁样式
			var aNode = realThis.aZtree.getNodeByTId(this.parentNode.parentNode.id) ;
			$('#'+aNode.id).removeClass('mergepannel-layout-'+aNode.type+'-flashing') ;
		}) ;
		
	
	// 绑定界面元素事件
	$('.mergepannel-props-frame-type').change(function (){
		if(this.checked)
		{
			realThis.setFrameLayout(realThis.eleSelectedItem,$(this).val()) ;
		}
	}) ;
}
/**
 * 扫描网页上的视图div，建立frame/view 树形结构
 */
MergerPannel.Layout.prototype.scanFrameViewStruct = function (){
	var $ = jquery ;
	var realThis = this ;
	
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
		// frame 类型
		if(sType=='frame')
		{
			if( $(this).hasClass('jc-frame-horizontal') )
			{
				aLayoutItem.layout = 'h' ;
			}
			// default jc-frame-vertical
			else
			{
				aLayoutItem.layout = 'v' ;
			}
		}
		$(this).data('object',aLayoutItem) ;
		
		var eleParentFrame = $(this).parents('.jc-layout').get(0) ;
		if( !eleParentFrame )
		{
			realThis.arrZTreeRootNodes.push(aLayoutItem) ;
		}
		else
		{
			$(eleParentFrame).data('object').children.push(aLayoutItem) ;
		}
	})	
}
/**
 * 面板尺寸发生变化时重新计算界面元素的尺寸和位置
 */
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

/**
 * 移动 frame/view 到另一个 frame 内
 * 参数 view, frame 都是 html div 元素 
 * 将 view 移动到 frame 里面
 */
MergerPannel.Layout.prototype.moveIn = function(view,frame)
{
	$ = jquery ;
	if( $(frame).children('.jc-layout-item-end').size()<1 )
	{
		$(view).appendTo($(frame)) ;
	}
	else
	{
		$(view).insertBefore( $($(frame).children('.jc-layout-item-end').last()) ) ;
	}
	// frame 重新布局
	this.layoutFrame(frame) ;
}
/**
 * 移动 frame/view 到另一个 frame/view 前面
 * 参数 view, frame 都是 html div 元素
 * 将 view 移动到 behindItem 的前面
 */
MergerPannel.Layout.prototype.moveBefore = function(view,behindItem)
{
	$ = jquery ;
	$(view).insertBefore($(behindItem)) ;
	// frame 重新布局
	this.layoutFrame(behindItem.parentNode) ;
}
/**
 * 移动 frame/view 到另一个 frame/view 前面
 * 参数 view, frame 都是 html div 元素
 * 将 view 移动到 frontItem 的后面
 */
MergerPannel.Layout.prototype.moveAfter = function(view,frontItem)
{
	$ = jquery ;
	$(view).insertAfter($(frontItem)) ;
	// frame 重新布局
	this.layoutFrame(frontItem.parentNode) ;
}

/**
 * 设置一个frame的类型：横向(h), 纵向(v)
 */
MergerPannel.Layout.prototype.setFrameLayout = function(frame,sType)
{
	var $ = jquery ;
	
	var aNode = this.itemInfoByEleId(frame.id) ;
	aNode.layout = sType ;
	
	this.layoutFrame(frame,aNode) ;
}
MergerPannel.Layout.prototype.layoutFrame = function(frame,node)
{
	var $ = jquery ;	
	// 清理样式
	$(frame).removeClass('jc-frame-horizontal')
			.removeClass('jc-frame-vertical') 
			.children('.jc-layout')
				.removeClass('jc-layout-item-horizontal')
				.removeClass('jc-layout-item-vertical') ;
	// 设置样式
	var sLayout = node.layout ;
	$(frame).addClass( MergerPannel.Layout.mapLayoutFrameStyles[sLayout] )
			.children('.jc-layout').addClass( MergerPannel.Layout.mapLayoutItemStyles[sLayout] ) ;
	
	// 计算成员宽度
	this.calculateItemsWidth(frame,node) ;
}
MergerPannel.Layout.mapLayoutFrameStyles = {
		h: 'jc-frame-horizontal'
		, v: 'jc-frame-vertical'
} ;
MergerPannel.Layout.mapLayoutItemStyles = {
		h: 'jc-layout-item-horizontal'
		, v: 'jc-layout-item-vertical'
} ;
/**
 * 计算frame内各个item(frame/view)的宽度
 * 横向布局frame内的item,除去指定宽度的元素,剩下元素平均宽度
 * 纵向布局frame清除宽度设置(自适应)
 */
MergerPannel.Layout.prototype.calculateItemsWidth = function(frame,node)
{
}

/**
 * 通过 frame/view 的id, 得到配置对象
 */
MergerPannel.Layout.prototype.itemInfoByEleId = function(eleId)
{
	return this.aZtree.getNodeByParam('id',eleId) ;
}

/**
 * 打开 frame 或 view 的属性界面
 * itemData 是 frame/view 的数据，itemEle 是 html 元素
 */
MergerPannel.Layout.prototype.openProperty = function(itemData,itemEle)
{
	var $ = jquery ;
	
	// 设置选中状态
	
	
	$('#mergepannel-props-id').html(itemData.id) ;
	
	// frame
	if( itemData.type=='frame' )
	{
		$('#mergepannel-props-type').html('视图框架') ;
		$('#mergepannel-props-frame-type').show() ;

		$('.mergepannel-props-frame-type').attr('checked',false) ;
		$('#mergepannel-props-frame-ipt-'+itemData.layout).attr('checked',true) ;
		console.log(itemData.id+'#mergepannel-props-frame-ipt-'+itemData.layout) ;
	}
	else
	{
		$('#mergepannel-props-type').html('视图') ;
		$('#mergepannel-props-frame-type').hide() ;
	}
	
	$('#mergepannel-properties').show() ;
}
