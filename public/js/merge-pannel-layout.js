MergerPannel.Layout = function ()
{
	this.arrZTreeRootNodes = [] ;
	this.aZtree = [] ;
	
	this.eleSelectedItem = null ;
	this.dataSelectedItem = null ;
	
	this.nAssignedFrameId = 0 ;
	// 单件
	MergerPannel.Layout.singleton = this ;
}


MergerPannel.Layout.prototype.init = function()
{	
	// 初始化 ztree
	this._initZtree() ;
	
	// 初始化界面元素
	this._initUi() ;	
}
/**
 * 初始化界面
 */
MergerPannel.Layout.prototype._initUi = function (){
	var $ = jquery ;
	var realThis = this ;

	// 绑定界面元素事件
	//  frame 类型单选按钮组
	$('.mergepannel-props-frame-type').change(function (){
		if(this.checked)
		{
			realThis.setFrameLayout(realThis.eleSelectedItem,$(this).val()) ;
		}
	}) ;
	
	// 保存按钮
	$('#mergepannel-layout-savebtn').click(function (){
		realThis.saveLayout() ;
	}) ;
	
	// frame 按钮事件
	$('#mergepannel-props-frame-autowidth-btn').click(function(){
		realThis.autoItemsWidth(realThis.eleSelectedItem,realThis.dataSelectedItem) ;
	}) ;
	$('#mergepannel-props-frame-autoheight-btn').click(function(){
		realThis.autoItemsHeight(realThis.eleSelectedItem,realThis.dataSelectedItem) ;
	}) ;
	$('#mergepannel-props-frame-clearwidth-btn').click(function(){
		$(realThis.eleSelectedItem).children('.jc-layout').width('') ;
	}) ;
	$('#mergepannel-props-frame-clearheight-btn').click(function(){
		$(realThis.eleSelectedItem).children('.jc-layout').height('') ;
	}) ;
	$('#mergepannel-props-frame-delete-btn').click(function(){
		realThis.deleteFrame(realThis.eleSelectedItem,realThis.dataSelectedItem) ;
	}) ;
	$('#mergepannel-props-frame-new-btn').click(function(){
		realThis.addChildFrame(realThis.eleSelectedItem,realThis.dataSelectedItem) ;
	}) ;
	
	// 属性
	$('#mergepannel-props-common input').blur(function (){
		realThis.applyProperties() ;
	}) ;
	$('#mergepannel-props-common select').change(function (){
		realThis.applyProperties() ;
	}) ;
}
/**
 * 初始化 ztree
 */
MergerPannel.Layout.prototype._initZtree = function (){
	var $ = jquery ;
	var realThis = this ;

	// 扫描网页上的 视图布局结构
	this.scanFrameViewStruct() ;
	
	// 创建 ztree
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
				// 鼠标按下
				onMouseDown: function(event,treeId,treeNode) {
					$('#'+treeNode.id).addClass('mergepannel-layout-item-dragging-active') ;
				}
				// 鼠标释放
				, onMouseUp: function(event,treeId,treeNode) {
					$('.mergepannel-layout-item-dragging-active').removeClass('mergepannel-layout-item-dragging-active') ;
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
					// 应用上一次打开的属性表单
					if(realThis.eleSelectedItem!=null)
					{
						realThis.applyProperties() ;
					}
					
					realThis.eleSelectedItem = document.getElementById(treeNode.id) ;
					realThis.dataSelectedItem = treeNode ;
					realThis.openProperty( treeNode, realThis.eleSelectedItem ) ;
				}
			}
	}, this.arrZTreeRootNodes) ;
	
	// 全部展开
	this.aZtree.expandAll(true) ;
		
	// ztree node 的样式
	this._initZtreeNodesStylte() ;
}
MergerPannel.Layout.prototype._initZtreeNodesStylte = function (){
	var $ = jquery ;
	realThis = this ;
	$('li[treenode]>a>span:not(.mergepannel-viewtree-item-draggable)')
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
		})
		.each(function(){
			console.log(this.id) ;			
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
			// ztree的属性
			name : this.id
			, icon: sMvcMergerPublicFolderUrl+'/'+sType+'.png'
			, children : []
			, drop: sType=='frame'
			, drag: true
			// 非ztree的属性
			, type : sType
			, id : this.id
			, inframe: inframe
			, props: {}
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
 * 保存布局配置
 */
MergerPannel.Layout.prototype.saveLayout = function(){
	var $ = jquery ;
	var realThis = this ;
	
	// 分析frame/view 结构, 并整理成后端PHP所需的数据格式
	var mapItemDatas = {} ;
	var mapRootNodes = {} ;
	$('.jc-layout').each(function ()
	{
		var aNode = realThis.getDataByEleId(this.id) ;
		if(!aNode)
		{
			return ;
		}
		
		var aLayoutItem = {
			type : aNode.type
			, id : this.id
			, items: []
		}
		
		// frame 类型
		if(aNode.type=='frame')
		{
			aLayoutItem.layout = aNode.layout ;
		}
		
		mapItemDatas[this.id] = aLayoutItem ;

		var eleParentFrame = $(this).parents('.jc-layout').get(0) ;
		if( !eleParentFrame || !$(eleParentFrame).hasClass('jc-frame') )
		{
			mapRootNodes[this.id] = aLayoutItem ;
		}
		else
		{
			mapItemDatas[eleParentFrame.id].items.push(aLayoutItem) ;
		}
	}) ;
	
	// ajax 提交给PHP
	$.ajax({
		type: "POST"
		, url: '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=msgqueue&act=save' 
		, data: { layout: mapRootNodes, controller: sMvcMergerController }
		, complete: function(req){
			// 显示操作结果消息队列
			$('#mergepannel-layout-msgqueue').html(req.responseText) ;
			// 重新计算ui布局(消息队列可能影响ui界面)
			realThis.resizeDialog() ;
		}
	}) ;
	
}
/**
 * 面板尺寸发生变化时重新计算界面元素的尺寸和位置
 */
MergerPannel.Layout.prototype.resizeDialog = function ()
{
	var $ = jquery ;
	$('#mergepannel-viewtree').height(
			$('#mergepannel-dialog').height() - $('#mergepannel-layout-struct-title').height() - $('#mergepannel-layout-action').height() - 10
	) ;
	$('#mergepannel-properties').height(
			$('#mergepannel-dialog').height() - $('#mergepannel-layout-action').height() - 5
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
	
	var aNode = this.getDataByEleId(frame.id) ;
	aNode.layout = sType ;
	
	this.layoutFrame(frame,aNode) ;
}
MergerPannel.Layout.prototype.layoutFrame = function(frame,node)
{
	var $ = jquery ;
	
	if(typeof(node)!=='undefine')
	{
		var node = this.getDataByEleId(frame.id) ;
	}
	
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
 * 平均设置frame内部成员的宽度
 */
MergerPannel.Layout.prototype.autoItemsWidth = function(frame,node){
	if( node.layout==='h' )
	{
		var aChildren = $(frame).children('.jc-layout') ;
		if( aChildren.size() < 1 )
		{
			return ;
		}
		var nWidth = Math.floor( $(frame).width()/aChildren.size() ) ;
		aChildren.width(nWidth-5) ;
	}
	else if( node.layout==='v' )
	{
		$(frame).children('.jc-layout').width('100%') ;
	}
}
/**
 * frame内部成员的高度相等（都设为原来的最大值）
 */
MergerPannel.Layout.prototype.autoItemsHeight = function(frame,node){
	var nMaxH = 0 ;
	$(frame).children('.jc-layout').each(function (){
		if( $(this).height()>nMaxH )
		{
			nMaxH = $(this).height() ;
		}
	}).height(nMaxH) ;
}

/**
 * 通过 frame/view 的id, 得到配置对象
 */
MergerPannel.Layout.prototype.getDataByEleId = function(eleId){
	return this.aZtree.getNodeByParam('id',eleId) ;
}

/**
 * 打开 frame 或 view 的属性界面
 * itemData 是 frame/view 的数据，itemEle 是 html 元素
 */
MergerPannel.Layout.prototype.openProperty = function(itemData,itemEle){
	var $ = jquery ;
	
	$('#mergepannel-props-id').html(itemData.id) ;
	
	// frame
	if( itemData.type=='frame' )
	{
		$('#mergepannel-props-type').html('视图框架') ;
		$('#mergepannel-props-frame').show() ;

		$('.mergepannel-props-frame-type').attr('checked',false) ;
		$('#mergepannel-props-frame-ipt-'+itemData.layout).attr('checked',true) ;
		console.log(itemData.id+'#mergepannel-props-frame-ipt-'+itemData.layout) ;
		
		$('#mergepannel-props-frame-delete-btn').attr( 'disabled', $(itemEle).hasClass('cusframe')?false:true ) ;
	}
	else
	{
		$('#mergepannel-props-type').html('视图') ;
		$('#mergepannel-props-frame').hide() ;
	}
	
	$('#mergepannel-properties').show() ;
	
	this.updateProperties();
}

/**
 * 显示选中的 frame/view 对应属性表单值
 */
MergerPannel.Layout.prototype.updateProperties = function(){
	var $ = jquery ;
	
	$('#mergepannel-props-ipt-width').val(this.eleSelectedItem.style.width) ;
	$('#mergepannel-props-ipt-height').val(this.eleSelectedItem.style.height) ;
	$('#mergepannel-props-sel-text-align').val(this.eleSelectedItem.style.textAlign) ;
	$('#mergepannel-props-sel-vertical-align').val(this.eleSelectedItem.style.verticalAlign) ;
}

/**
 * 将属性表单中的值应用到 frame/view 上
 */
MergerPannel.Layout.prototype.applyProperties = function(){
	var $ = jquery ;
	
	this.eleSelectedItem.style.width = $('#mergepannel-props-ipt-width').val() ;
	this.eleSelectedItem.style.height = $('#mergepannel-props-ipt-height').val() ;
	this.eleSelectedItem.style.textAlign = $('#mergepannel-props-sel-text-align').val() ;
	this.eleSelectedItem.style.verticalAlign = $('#mergepannel-props-sel-vertical-align').val() ;
}
/**
 * 删除一个frame（只有用户添加的frame可以被删除）
 */
MergerPannel.Layout.prototype.deleteFrame = function(itemEle,itemData){
	if( $(itemEle).children('.jc-layout').size() )
	{
		alert('请先移除布局框架下的成员，再删除布局框架。') ;
		return ;
	}
	
	$(itemEle).remove() ;
	this.aZtree.removeNode(itemData) ;
}
/**
 * 添加一个下级frame
 */
MergerPannel.Layout.prototype.addChildFrame = function(itemEle,itemData){
	var $ = jquery ;
	var sEleId = 'frame-' + (this.nAssignedFrameId ++) ;
	
	this.aZtree.addNodes(itemData,{
		// ztree的属性
		name : 'frame'
		, icon: sMvcMergerPublicFolderUrl+'/frame.png'
		, children : []
		// 非ztree的属性
		, type : 'frame'
		, layout : 'v'
		, id : sEleId
		, inframe: true
		, props: {}
	}) ;
	// ztree node 的样式
	this._initZtreeNodesStylte() ;
	
	// 创建html元素
	$(itemEle).append("<div id=\""+sEleId+"\" class=\"jc-layout jc-frame cusframe\"><div class=\"jc-layout-item-end\"></div></div>") ;

	// 移动
	this.moveIn(document.getElementById(sEleId),itemEle) ;
}
