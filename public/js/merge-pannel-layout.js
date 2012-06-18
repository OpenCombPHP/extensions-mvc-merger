MergerPannel.Layout = function() {
	this.arrZTreeRootNodes = [];
	this.aZtree = [];

	this.eleSelectedItem = null;
	this.dataSelectedItem = null;
	this.topFrame = new Array();
	
	// 从后端 setting 中取出上一次输入的属性值，用来恢复当前属性面板中的input (mapMVCMergerItemProperties)
	//key 是css属性名称,value是表单对应ID
	this.mapPropertyNames = {
		'width' : 'mergepannel-props-ipt-width',
		'height' : 'mergepannel-props-ipt-height',
		'skin' : 'mergepannel-props-ipt-skin',
		'class' : 'mergepannel-props-class',
		'display' : 'mergepannel-props-display',
		'background-image' : 'mergepannel-props-background-image',
		'background-color' : 'mergepannel-props-background-color',
		'background-position' : 'mergepannel-props-background-position',
		'background-repeat' : 'mergepannel-props-background-repeat',
		'position' : 'mergepannel-props-ipt-position',
		'z-index' : 'mergepannel-props-ipt-zindex',
		'top' : 'mergepannel-props-ipt-top',
		'left' : 'mergepannel-props-ipt-left',
		'bottom' : 'mergepannel-props-ipt-bottom',
		'right' : 'mergepannel-props-ipt-right',
		'border-top-width' : 'mergepannel-props-ipt-border-top-width',
		'border-top-color' : 'mergepannel-props-ipt-border-top-color',
		'border-top-style' : 'mergepannel-props-ipt-border-top-style',
		'border-bottom-width' : 'mergepannel-props-ipt-border-bottom-width',
		'border-bottom-color' : 'mergepannel-props-ipt-border-bottom-color',
		'border-bottom-style' : 'mergepannel-props-ipt-border-bottom-style',
		'border-right-width' : 'mergepannel-props-ipt-border-right-width',
		'border-right-color' : 'mergepannel-props-ipt-border-right-color',
		'border-right-style' : 'mergepannel-props-ipt-border-right-style',
		'border-left-width' : 'mergepannel-props-ipt-border-left-width',
		'border-left-color' : 'mergepannel-props-ipt-border-left-color',
		'border-left-style' : 'mergepannel-props-ipt-border-left-style',
		'margin-top' : 'mergepannel-props-ipt-margin-top',
		'margin-right' : 'mergepannel-props-ipt-margin-right',
		'margin-bottom' : 'mergepannel-props-ipt-margin-bottom',
		'margin-left' : 'mergepannel-props-ipt-margin-left',
		'padding-top' : 'mergepannel-props-ipt-padding-top',
		'padding-right' : 'mergepannel-props-ipt-padding-right',
		'padding-bottom' : 'mergepannel-props-ipt-padding-bottom',
		'padding-left' : 'mergepannel-props-ipt-padding-left',
		'style' : 'mergepannel-props-style'
	};

	this.nAssignedFrameId = 0;
	// 单件
	MergerPannel.Layout.singleton = this;
}

MergerPannel.Layout.prototype.init = function() {
	var realthis = this;
	// 初始化 ztree
	this._initZtree();
	
	// 初始化界面元素
	this._initUi();
	
	// 初始化默认宽度
	this.updateLayout() ;
}
/**
 * 初始化界面
 */
MergerPannel.Layout.prototype._initUi = function() {
	var $ = jquery;
	var realThis = this;

	// 绑定界面元素事件
	// frame 类型单选按钮组
	$('.mergepannel-props-frame-type').change(function() {
		if (this.checked) {
			realThis.setFrameLayout(realThis.eleSelectedItem, $(this).val());
		}
	});

	// 保存按钮
	$('#mergepannel-layout-savebtn').click(function() {
		realThis.saveLayout();
	});
	// 清理按钮
	$('#mergepannel-layout-cleanbtn').click(function() {
		realThis.cleanLayout();
	});

	$('#mergepannel-props-frame-clearwidth-btn').click(function() {
		$(realThis.eleSelectedItem).children('.jc-layout').width('');
	});
	$('#mergepannel-props-frame-clearheight-btn').click(function() {
		$(realThis.eleSelectedItem).children('.jc-layout').height('');
	});
	$('#mergepannel-props-frame-center-btn').click(
			function() {
				$(realThis.eleSelectedItem).children('.jc-layout').toggleClass(
						'place_center');
			});
	$('#mergepannel-props-frame-delete-btn').click(
			function() {
				realThis.deleteFrame(realThis.eleSelectedItem,
						realThis.dataSelectedItem);
			});
	$('#mergepannel-props-frame-new-btn').click(
			function() {
				realThis.addChildFrame(realThis.eleSelectedItem,
						realThis.dataSelectedItem);
			});

	// 属性
	$('#mergepannel-props-common input').blur(function(event) {
		realThis.applyProperties(event);
	});
	$('#mergepannel-props-common select').change(function(event) {
		realThis.applyProperties(event);
	});
	$('#mergepannel-props-common textarea').change(function(event) {
		realThis.applyProperties(event);
	});

	// 激活提示
	$('.mergepannel-tippalbe-element').poshytip({
		className : 'tip-yellowsimple',
		showTimeout : 1,
		alignTo : 'target',
		alignX : 'center',
		offsetY : 5,
		allowTipHover : false
	});
	
	//属性值扫描,解决第一次打开panel并保存后丢失属性的问题,顺便解决display的半透明treenode的特效
	var bIsNew = true;
	for(var keys in mapMVCMergerItemProperties){
		bIsNew = false; //不需要扫描
		if(mapMVCMergerItemProperties[keys]['display'] == 'none'){
			var tid = realThis.aZtree.getNodesByParam("id",keys)[0]['tId'];
			$('#'+tid).animate({opacity:'0.5'},0);
		}
	}
	if(bIsNew){
		var allLinkOfTreeNode = $("#mergepannel-viewtree").find('a');
		allLinkOfTreeNode.click();
//		allLinkOfTreeNode.first().click();
	}
	
	//自动选中第一个
	$("#mergepannel-viewtree").find('a:first').click();
	
	//border特殊处理
	$('#mergepannel-props-ipt-borders-showmore').toggle(function(){
		$(this).removeClass('mergepannel-props-ipt-borders-arrow-left').addClass('mergepannel-props-ipt-borders-arrow-down');
		$("#mergepannel-props-ipt-borders").show();
	},function(){
		$(this).removeClass('mergepannel-props-ipt-borders-arrow-down').addClass('mergepannel-props-ipt-borders-arrow-left');
		$("#mergepannel-props-ipt-borders").hide();
	});
	
	//保存方式
	//	处理参数列表,清理c和mvcmerger参数
	var arrParamsTemp = location.search.substr( 1 ).split('&'); 
	var arrParams = [];
	for(var nKey in arrParamsTemp){
		if(
			arrParamsTemp[nKey].indexOf("mvcmerger=") != 0
			&& arrParamsTemp[nKey].indexOf("c=") != 0
		){
			arrParams.push(arrParamsTemp[nKey]);
		}
	}
//	arrParams.sort();
	var sParams = arrParams.join('&');
	$("#mergepannel-layout-save-parmas").val(sParams);
	
	$("#mergepannel-layout-saveType").click(function(){
		if( $(this).val() == 'type' ){
		}else if( $(this).val() == 'current' ){
		}else if( $(this).val() == 'special' ){
			$("#mergepannel-dialog").dialog('option','height' , $("#mergepannel-dialog").dialog('option','height') + 30 );
			$("#mergepannel-layout-save-parmas").show(0);
		}else {
			alert('未知保存方式');
		}
		if( $(this).val() != 'special' && $("#mergepannel-layout-save-parmas:visible").length == 1){
			$("#mergepannel-dialog").dialog('option','height' , $("#mergepannel-dialog").dialog('option','height') - 30 );
			$("#mergepannel-layout-save-parmas").hide(0);
		}
	});
}
/**
 * 初始化 ztree
 */
MergerPannel.Layout.prototype._initZtree = function() {
	var $ = jquery;
	var realThis = this;

	// 扫描网页上的 视图布局结构
	this.scanFrameViewStruct();

	// 创建 ztree
	this.aZtree = $.fn.zTree
			.init(
					$('#mergepannel-viewtree'),
					{
						view : {
							showLine : true,
							selectedMulti : false,
							dblClickExpand : true,
							nameIsHTML : true,
							expandSpeed : 0
						},
						edit : {
							enable : true,
							showRemoveBtn : false,
							showRenameBtn : false,
							drag : {
								isMove : true,
								prev : true,
								next : true,
								inner : true
							}
						},
						callback : {
							// 鼠标按下
							onMouseDown : function(event, treeId, treeNode) {
								if (!treeNode) {
									return;
								}
								$('#' + treeNode.id)
										.addClass(
												'mergepannel-layout-item-dragging-active');
							}
							// 鼠标释放
							,
							onMouseUp : function(event, treeId, treeNode) {
								$('.mergepannel-layout-item-dragging-active')
										.removeClass(
												'mergepannel-layout-item-dragging-active');
							}

							// 判断是否允许拖动
							,
							beforeDrag : function(treeId, treeNodes) {
								for ( var i = 0, l = treeNodes.length; i < l; i++) {
									if (treeNodes[i].inframe === false) {
										return false;
									}
								}
								return true;
							}

							// 判断是否允许放置
							,
							beforeDrop : function(treeId, treeNodes,
									targetNode, moveType) {
								// 移动到目标的 前/后，需要判断目标的上级是否是一个 frame
								if (moveType == 'prev' || moveType == 'next') {
									return targetNode.inframe;
								}
								// 移动到目标的内部，判断目标本身是否是一个 frame
								else if (moveType == 'inner') {
									return targetNode.type !== 'view';
								} else {
									// what wrong !?
								}
								return false;
							}

							// 放置事件
							,
							onDrop : function(event, treeId, treeNodes, targetNode, moveType) {
								for ( var i in treeNodes) {
									var eleView = document.getElementById(treeNodes[i].id);
									var eleTargetItem = document.getElementById(targetNode.id);

									if (moveType == 'prev') {
										realThis.moveBefore(eleView, eleTargetItem);
									} else if (moveType == 'next') {
										realThis.moveAfter(eleView, eleTargetItem);
									} else if (moveType == 'inner') {
										realThis.moveIn(eleView, eleTargetItem);
									}
								}
							}

							// 点击 frame/view ，打开旁边的属性界面
							,
							onClick : function(event, treeId, treeNode) {
								// 应用上一次打开的属性表单
								if (realThis.eleSelectedItem != null) {
									realThis.applyProperties();
								}

								realThis.eleSelectedItem = document.getElementById(treeNode.id);
								realThis.dataSelectedItem = treeNode;
								realThis.openProperty(treeNode,realThis.eleSelectedItem);
							}
						}
					}, this.arrZTreeRootNodes);
	

	// 全部展开
	this.aZtree.expandAll(true);
	
	//隐藏编辑面板自身节点
	jquery( "#" + this.aZtree.getNodeByParam('id', 'MergePannelDialog-0' )['tId'] ).hide();
	
	// ztree node 的样式
	this._initZtreeNodesStylte();
}

MergerPannel.Layout.prototype._initZtreeNodesStylte = function() {
	var $ = jquery;
	realThis = this;
	$('#mergepannel-viewtree li[treenode]>a>span:not(.mergepannel-viewtree-item-draggable)')
			// 补充 zTree 的事件
			.die('mouseover mouseout')
			.live(
					'mouseover mouseout',
					function(event) {
						if (event.type == 'mouseover') {
							// 鼠标移过 item 时， 对应的 frame/view 闪烁样式
							var aNode = realThis.aZtree.getNodeByTId(this.parentNode.parentNode.id);
							var flashing = $('<div id="mergepannel-layout-flashing"></div>');
							var position = $('#' + aNode.id).position();
							var width = $('#' + aNode.id).outerWidth(true);
							var height = $('#' + aNode.id).outerHeight(true);
							flashing.css({
								'top' : position.top,
								'left' : position.left,
								'width' : width,
								'height' : height
							});
							$('body').append(
									flashing.addClass('mergepannel-layout-'
											+ aNode.type + '-flashing'));
							flashing.show();
						} else if (event.type == 'mouseout') {
							// 取消 item 对应的 frame/view 闪烁样式
							$('#mergepannel-layout-flashing').remove();
						}
					});
}

MergerPannel.Layout.prototype.initArea = function(resetFun) {
	var realthis = this;
	var layouts = realthis.topFrame;
	try{
		jquery.each(layouts,function(v,b){
			realthis.calculateMinMax( jquery(b) );
			realthis.assignSpace( jquery(b) );
		});
	}catch(e){
		
		realthis.log(e.message);
		
		//回滚
		if( typeof resetFun == "function" ){
			resetFun();
		}
		
		jquery.each(layouts,function(v,b){
			realthis.calculateMinMax( jquery(b) );
			realthis.assignSpace( jquery(b) );
		});
	}
}



/**
 * 扫描网页上的视图div，建立frame/view 树形结构
 */
MergerPannel.Layout.prototype.scanFrameViewStruct = function() {
	var $ = jquery;
	var realThis = this;

	this.arrZTreeRootNodes = [];

	// 分析建立 frame/view 结构
	$('.jc-layout')
			.each(
					function() {
						var inframe = $(this.parentNode).hasClass('jc-frame');
						var sType = $(this).hasClass('jc-view') ? 'view'
								: 'frame';

						var sName = '';
						
						if (sType == 'frame') {
							sName = '布局框架:';
							if ($(this).hasClass('jc-frame-horizontal')) {
								sName += '横';
							} else {
								sName += '竖';
							}
						} else if (sType == 'view') {
							var divs = $(this).filter('.jc-layout:first')
									.clone();
							divs.find('script , .jc-layout').remove();
							sName = divs.text().replace(/[\s]+/g, ' ')
									.substring(0, 40)
									+ '...';
						}

						var aLayoutItem = {
							// ztree的属性
							name : sName,
							icon : sMvcMergerPublicFolderUrl + '/' + sType
									+ '.png',
							children : [],
							drop : sType == 'frame',
							drag : true
							// 非ztree的属性
							,
							type : sType,
							id : this.id,
							inframe : inframe,
							props : {}
						}
						// frame 类型
						if (sType == 'frame') {
							if ($(this).hasClass('jc-frame-horizontal')) {
								aLayoutItem.layout = 'h';
							}
							// default jc-frame-vertical
							else {
								aLayoutItem.layout = 'v';
							}
						}
						$(this).data('object', aLayoutItem);

						var eleParentFrame = $(this).parents('.jc-layout').get(
								0);
						if (!eleParentFrame) {
							realThis.arrZTreeRootNodes.push(aLayoutItem);
						} else {
							$(eleParentFrame).data('object').children
									.push(aLayoutItem);
						}
					})
}
/**
 * 保存布局配置
 */
MergerPannel.Layout.prototype.saveLayout = function() {
	var $ = jquery;
	var realThis = this;

	// 分析frame/view 结构, 并整理成后端PHP所需的数据格式
	var mapItemDatas = {};
	var mapRootNodes = {};
	$('.jc-layout').each(function() {
		var aNode = realThis.getDataByEleId(this.id);
		if (!aNode) {
			return;
		}

		var skinAndClass = '';
		if (mapMVCMergerItemProperties[this.id]) {
			skinAndClass = mapMVCMergerItemProperties[this.id]['skin'];
		}

		var aLayoutItem = {
			type : aNode.type,
			id : this.id,
			'cssClass' : [ skinAndClass ],
			style : $(this).attr("style"),
			items : []
		};

		// frame 类型
		if (aNode.type == 'frame') {
			aLayoutItem.layout = aNode.layout;
		}

		mapItemDatas[this.id] = aLayoutItem;

		var eleParentFrame = $(this).parents('.jc-layout').get(0);
		if (!eleParentFrame || !$(eleParentFrame).hasClass('jc-frame')) {
			mapRootNodes[this.id] = aLayoutItem;
		} else {
			mapItemDatas[eleParentFrame.id].items.push(aLayoutItem);
		}
	});

	// ajax 提交给PHP
	var sParams = $("#mergepannel-layout-save-parmas").val().replace(/&/g,'@').replace(/=/g,'^');
	if(sParams == '' || $("#mergepannel-layout-saveType").val() == 'type'){
		sParams = '*';
	}
	$.ajax({
		type : "POST",
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=msgqueue&act=save',
		data : {
			layout : mapRootNodes
			, controller : sMvcMergerController
			, properties : mapMVCMergerItemProperties
			, requestparams : sParams
		},
		complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-layout-msgqueue').html(req.responseText);
			// 重新计算ui布局(消息队列可能影响ui界面)
			realThis.resizeDialog();
		}
	});
}

/**
 * 保存布局配置
 */
MergerPannel.Layout.prototype.cleanLayout = function() {
	var $ = jquery;
	
	var sParams = $("#mergepannel-layout-save-parmas").val().replace(/&/g,'@').replace(/=/g,'^');
	if(sParams == '' || $("#mergepannel-layout-saveType").val() == 'type'){
		sParams = '*';
	}
	$.ajax({
		type : "POST",
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=msgqueue&act=clean',
		data : {
			controller : sMvcMergerController
			, requestparams : sParams
		},
		complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-layout-msgqueue').html(req.responseText);
			// 重新计算ui布局(消息队列可能影响ui界面)
			realThis.resizeDialog();
		}
	});
}

/**
 * 面板尺寸发生变化时重新计算界面元素的尺寸和位置
 */
MergerPannel.Layout.prototype.resizeDialog = function() {
	var $ = jquery;
	var nHeight = $('#mergepannel-dialog').height() - 30;// $('#mergepannel-layout-action').outerHeight(true) ;
	$('#mergepannel-properties , #mergepannel-layout-struct , #mergepannel-layout-views').height( nHeight );
	
	$('#mergepannel-props-properties-overflow').height( 
			nHeight
			- $('#mergepannel-props-type-text').parent('div:first').outerHeight(true)
			- 10
	);
	
	$('#mergepannel-viewtree').height( 
			nHeight
			- $('#mergepannel-layout-struct-title').parent('div:first').outerHeight(true) 
			- ( $('#mergepannel-viewtree').outerHeight() - $('#mergepannel-viewtree').height() )
			- 10
	);
}

/**
 * 移动 frame/view 到另一个 frame 内 参数 view, frame 都是 html div 元素 将 view 移动到 frame 里面
 */
MergerPannel.Layout.prototype.moveIn = function(view, frame) {
	$ = jquery;
	if ($(frame).children('.jc-layout-item-end').size() < 1) {
		$(view).appendTo($(frame));
	} else {
		$(view).insertBefore( $($(frame).children('.jc-layout-item-end').last()));
	}
	// frame 重新布局
	this.layoutFrame(frame);
};
/**
 * 移动 frame/view 到另一个 frame/view 前面 参数 view, frame 都是 html div 元素 将 view 移动到
 * behindItem 的前面
 */
MergerPannel.Layout.prototype.moveBefore = function(view, behindItem) {
	$ = jquery;
	$(view).insertBefore($(behindItem));
	// frame 重新布局
	this.layoutFrame(behindItem.parentNode);
};
/**
 * 移动 frame/view 到另一个 frame/view 前面 参数 view, frame 都是 html div 元素 将 view 移动到
 * frontItem 的后面
 */
MergerPannel.Layout.prototype.moveAfter = function(view, frontItem) {
	$ = jquery;
	$(view).insertAfter($(frontItem));
	// frame 重新布局
	this.layoutFrame(frontItem.parentNode);
};

/**
 * 设置一个frame的类型：横向(h), 纵向(v)
 */
MergerPannel.Layout.prototype.setFrameLayout = function(frame, sType) {
	var $ = jquery;
	var realthis = this;
	var aNode = this.getDataByEleId(frame.id);
	var oldLayout = aNode.layout;
	aNode.layout = sType;

	this.layoutFrame(frame, aNode);
	realthis.log("layout initarea");
	this.initArea(function(){
		realthis.setFrameLayout(frame,oldLayout);
	});
};
MergerPannel.Layout.prototype.layoutFrame = function(frame, node) {
	var $ = jquery;

	if (typeof (node) !== 'undefine') {
		var node = this.getDataByEleId(frame.id);
	}
	// 清理样式
	$(frame).removeClass('jc-frame-horizontal')
			.removeClass('jc-frame-vertical')
			.children('.jc-layout')
			.removeClass('jc-layout-item-horizontal')
			.removeClass('jc-layout-item-vertical');
	// 设置样式
	var sLayout = node.layout;
	$(frame).addClass( MergerPannel.Layout.mapLayoutFrameStyles[sLayout] )
			.children('.jc-layout').addClass( MergerPannel.Layout.mapLayoutItemStyles[sLayout] );
};
MergerPannel.Layout.mapLayoutFrameStyles = {
	h : 'jc-frame-horizontal',
	v : 'jc-frame-vertical'
};
MergerPannel.Layout.mapLayoutItemStyles = {
	h : 'jc-layout-item-horizontal',
	v : 'jc-layout-item-vertical'
};
/**
 * 平均设置frame内部成员的宽度
 */
MergerPannel.Layout.prototype.autoItemsWidth = function(frame, node) {
	var $ = jquery;
	var nWidth = 0;
	var aChildren = $(frame).children('.jc-layout');
	if (node.layout === 'h') {
		if (aChildren.size() < 1) {
			return;
		}
		var borderWidth = 0;
		aChildren.each(function(v,b){
			borderWidth += $(b).outerWidth(true) - $(b).width();
		});
		nWidth = Math.floor( ($(frame).width() - borderWidth ) / aChildren.size() );
	} else if (node.layout === 'v') {
		aChildren.each(function(v,b){
			if($(b).width() > nWidth){
				nWidth = $(b).width();
			}
		});
	}
	aChildren.width(nWidth);
	aChildren.each(function(v,b){
		mapMVCMergerItemProperties[b.id]['width'] = nWidth;
	});
}
/**
 * frame内部成员的高度相等（都设为原来的最大值）
 */
MergerPannel.Layout.prototype.autoItemsHeight = function(frame, node) {
	var nMaxH = 0;
	var $ = jquery;
	var aChildren = $(frame).children('.jc-layout');
	var nHeight = 0;
	if (node.layout === 'h') {
		aChildren.each(function(v,b){
			if($(b).height() > nHeight){
				nHeight = $(b).height();
			}
		});
	} else if (node.layout === 'v') {
		if (aChildren.size() < 1) {
			return;
		}
		nHeight = Math.floor($(frame).height() / aChildren.size());
	}
	aChildren.height(nHeight);
	aChildren.each(function(v,b){
		mapMVCMergerItemProperties[b.id]['height'] = nHeight;
	});
}

/**
 * 通过 frame/view 的id, 得到配置对象
 */
MergerPannel.Layout.prototype.getDataByEleId = function(eleId) {
	return this.aZtree.getNodeByParam('id', eleId);
}

/**
 * 打开 frame 或 view 的属性界面 itemData 是 frame/view 的数据，itemEle 是 html 元素
 */
MergerPannel.Layout.prototype.openProperty = function(itemData, itemEle) {
	var $ = jquery;

	$('#mergepannel-props-id').html(itemData.id);

	// frame
	if (itemData.type == 'frame') {
		$('#mergepannel-props-type').html('视图框架');
		$('#mergepannel-props-frame').show();

		$('.mergepannel-props-frame-type').attr('checked', false);
		$('#mergepannel-props-frame-ipt-' + itemData.layout).attr('checked', true);

		$('#mergepannel-props-frame-delete-btn').attr('disabled',
				$(itemEle).hasClass('cusframe') ? false : true);
	} else {
		$('#mergepannel-props-type').html('视图');
		$('#mergepannel-props-frame').hide();
	}

	$('#mergepannel-properties').show();

	this.updateProperties();
}

/**
 * 显示选中的 frame/view 对应属性表单值
 */
MergerPannel.Layout.prototype.updateProperties = function() {
	var $ = jquery;
	var sId = this.eleSelectedItem.id;

	for ( var sPropName in this.mapPropertyNames) {
		var sInputId = this.mapPropertyNames[sPropName];
		if (typeof (mapMVCMergerItemProperties[sId]) != 'undefined'
				&& typeof (mapMVCMergerItemProperties[sId][sPropName]) != 'undefined') {
			$('#' + sInputId).val(mapMVCMergerItemProperties[sId][sPropName]);
			//用户指定宽高处理
			if(sPropName == "width" || sPropName == "height"){
				$(this.eleSelectedItem).data( 'min-' + sPropName , mapMVCMergerItemProperties[sId][sPropName]);
				$(this.eleSelectedItem).data( 'max-' + sPropName , mapMVCMergerItemProperties[sId][sPropName]);
			}
		} else {
			$('#' + sInputId).val('');
		}
	}

	// 从页面中的属性来处理skin控件的值
	if ($('#mergepannel-props-ipt-skin').length > 0) {
		var arrClasses = $(this.eleSelectedItem).attr('class').split(' ');
		for ( var nClass in arrClasses) {
			if (arrClasses[nClass].indexOf('jc-view-') == 0) {
				var bHasOne = false;
				$('#mergepannel-props-ipt-skin').find('option').each(
						function(v, b) {
							if ($(b).val() == arrClasses[nClass]) {
								bHasOne = true;
							}
						});
				if (!bHasOne) {
					$('#mergepannel-props-ipt-skin').append(
							"<option value='" + arrClasses[nClass] + "'>"
									+ arrClasses[nClass] + "</option>");
				}
				if (typeof mapMVCMergerItemProperties[sId] != 'undefined'
						&& typeof mapMVCMergerItemProperties[sId]['skin'] != 'undefined') {
					$('#mergepannel-props-ipt-skin').val(
							mapMVCMergerItemProperties[sId]['skin']);
				} else {
					$('#mergepannel-props-ipt-skin').val(arrClasses[nClass]);
				}
			}
		}
	}
}

/**
 * 将属性表单中的值应用到 frame/view 上
 */
MergerPannel.Layout.prototype.applyProperties = function(event) {
	var $ = jquery;
	var realthis = this;
	
	//width height 的特殊处理,这里避免框架上出现auto宽度和高度,并计算jc-layout的最小宽高最大宽高
	if(typeof mapMVCMergerItemProperties != 'undefined'
		&& typeof event !='undefined'
		&& (event.currentTarget.id == 'mergepannel-props-ipt-width' || event.currentTarget.id == 'mergepannel-props-ipt-height')
	){
		var type = event.currentTarget.id.split('-')[3];
		var oldValue = mapMVCMergerItemProperties[realthis.eleSelectedItem.id][type];
		
		mapMVCMergerItemProperties[realthis.eleSelectedItem.id][type] = $("#"+event.currentTarget.id).val();
		
		realthis.log("变值initarea");
		realthis.initArea(function(){
			mapMVCMergerItemProperties[realthis.eleSelectedItem.id][type] = oldValue;
		});
		
		$(realthis.eleSelectedItem).css( type , $('#'+this.mapPropertyNames[type]).val() );
	}
	
	//display特殊处理 , 如果结果为"隐藏",则半透明treenode
	if(typeof mapMVCMergerItemProperties != 'undefined'
		&& typeof event !='undefined'
		&& event.currentTarget.id == 'mergepannel-props-display'
		&& $(event.currentTarget).val() == 'none'){
		
		$("#mergepannel-viewtree").find('.curSelectedNode').parent('li').animate({opacity:'0.5'},0);
		
	}else{
		$("#mergepannel-viewtree").find('.curSelectedNode').parent('li').animate({opacity:'1'},0);
	}
	
	//border 特殊处理
	if(typeof event !='undefined'){
		if(event.currentTarget.id == 'mergepannel-props-ipt-border-width' ){
			$('#mergepannel-props-ipt-border-top-width').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-left-width').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-right-width').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-bottom-width').val($(event.currentTarget).val());
		}else if(event.currentTarget.id == 'mergepannel-props-ipt-border-color'){
			$('#mergepannel-props-ipt-border-top-color').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-left-color').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-right-color').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-bottom-color').val($(event.currentTarget).val());
		}else if(event.currentTarget.id == 'mergepannel-props-ipt-border-style'){
			$('#mergepannel-props-ipt-border-top-style').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-left-style').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-right-style').val($(event.currentTarget).val());
			$('#mergepannel-props-ipt-border-bottom-style').val($(event.currentTarget).val());
		}
	}
	
	//class 处理
	if(typeof mapMVCMergerItemProperties == 'undefined'){
		$(realthis.eleSelectedItem).removeClass(mapMVCMergerItemProperties[sId]['class']);
	}
	$(realthis.eleSelectedItem).addClass($('#mergepannel-props-class').val());
	
	if ($('#mergepannel-props-ipt-skin').val() != '') {
		$(realthis.eleSelectedItem).addClass( $('#mergepannel-props-ipt-skin').val() );
	} else {
		$('#mergepannel-props-ipt-skin').find('option').each(function(v, b) {
			if ($(b).val() != '') {
				$(realthis.eleSelectedItem).removeClass($(b).val());
			}
		});
	}
	
	for( var propertyName in this.mapPropertyNames){
		if(propertyName == 'class' || propertyName == 'skin' || propertyName == 'style'
			|| propertyName == 'width' || propertyName == 'height'
		){
			continue;
		}
		if( (propertyName =='position' && $('#'+this.mapPropertyNames[propertyName]).val() == 'static')
			|| (propertyName =='border-top-style' && $('#'+this.mapPropertyNames[propertyName]).val() == 'none')
			|| (propertyName =='border-left-style' && $('#'+this.mapPropertyNames[propertyName]).val() == 'none')
			|| (propertyName =='border-right-style' && $('#'+this.mapPropertyNames[propertyName]).val() == 'none')
			|| (propertyName =='border-bottom-style' && $('#'+this.mapPropertyNames[propertyName]).val() == 'none')
			|| (propertyName =='background-repeat' && $('#'+this.mapPropertyNames[propertyName]).val() == 'no-repeat')
		){
			continue;
		}
		$(realthis.eleSelectedItem).css( propertyName , $('#'+this.mapPropertyNames[propertyName]).val() );
	}
	
	//额外的style , 保持在style属性最后面
	$(realthis.eleSelectedItem).attr('style' , $(realthis.eleSelectedItem).attr('style') + ' ' + $('#mergepannel-props-style').val() );
	
	realthis.saveProperties();
}


/**
 * 将用户输入的属性值，保存在变量 mapMVCMergerItemProperties 中
 */
MergerPannel.Layout.prototype.saveProperties = function(sId) {
	var $ = jquery;
	var realthis = this;
	// 保存视图布局时，会将 mapMVCMergerItemProperties 提交给后端PHP，并保存到 setting 里，用于下一次编辑时显示
	var sId = realthis.eleSelectedItem.id;
	if (typeof (mapMVCMergerItemProperties[sId]) == 'undefined') {
		mapMVCMergerItemProperties[sId] = {};
	}
	
	for( var propertyName in this.mapPropertyNames){
		mapMVCMergerItemProperties[sId][propertyName] = $('#'+this.mapPropertyNames[propertyName]).val();
	}
}

/**
 * 删除一个frame（只有用户添加的frame可以被删除）
 */
MergerPannel.Layout.prototype.deleteFrame = function(itemEle, itemData) {
	if ($(itemEle).children('.jc-layout').size()) {
		alert('请先移除布局框架下的成员，再删除布局框架。');
		return;
	}

	$(itemEle).remove();
	this.aZtree.removeNode(itemData);
}
/**
 * 添加一个下级frame
 */
MergerPannel.Layout.prototype.addChildFrame = function(itemEle, itemData) {
	var $ = jquery;
	var sEleId = 'frame-' + (this.nAssignedFrameId++);

	this.aZtree.addNodes(itemData, {
		// ztree的属性
		name : 'frame',
		icon : sMvcMergerPublicFolderUrl + '/frame.png',
		children : []
		// 非ztree的属性
		,
		type : 'frame',
		layout : 'v',
		id : sEleId,
		inframe : true,
		props : {}
	});
	// ztree node 的样式
	this._initZtreeNodesStylte();

	// 创建html元素
	$(itemEle)
			.append(
					"<div id=\""
							+ sEleId
							+ "\" class=\"jc-layout jc-frame cusframe\"><div class=\"jc-layout-item-end\"></div></div>");

	// 移动
	this.moveIn(document.getElementById(sEleId), itemEle);
}
MergerPannel.Layout.prototype.log = function(msg){
	if(typeof console == 'object'){
		console.log(msg);
	}
};
















////////////////////////////////////////////////////////////////////////////////////////////////////////////

MergerPannel.Layout.prototype.updateLayout = function()
{
	var realthis = this ;
	
	jquery('.jc-layout').each(function(v,b){
		if( !jquery(b).parent().hasClass('jc-frame') )
		{
			// 计算 最小/最大 空间要求
			realthis.calculateMinMax( jquery(b) );
			
			// 分配空间
			realthis.assignSpace( jquery(b) );
		}
	});
	
	
}


/**
 * 初始化页面宽度和高度,防止css在布局框架上应用width:auto和height:auto
 * 
 * 自动宽高算法
 * 
 * 为了避免css中的auto(尤其是width的auto)
 * 我们提供了一种算法来固定frame和view的宽高
 * 所用到的值是
 * min-width,max-width,min-height,max-height
 * 框体的宽高不能小于min不能大于max,如果超出了,系统会通知用户他们的行为有问题
 * 我们接管的宽高默认的min都是50,max为系统自动赋值,例如min-width=50,max-width=777意味着用户没有给这个框体提供宽高,
 * 		系统现在让他以777的宽度显示,但是必要时可以缩到50,
 * 如果用户给框体指定了宽度500,那么数值应该是这个样子:min-width=500,max-width=500,就是说宽度只能是500,没有浮动余地,
 * max = -1 代表不限宽高最大值
 * */
MergerPannel.Layout.prototype.calculateMinMax = function(item) {
	
	var $ = jquery;
	var realthis = this;
	var defaultMin = 50 ;
		
	var children = item.children('.jc-layout') ;

	//排除编辑控件自身
	for(var i=children.length-1;i>=0;i--)
	{
		if( children[i].id == 'MergePannelDialog-0' )
		{
			children.splice(i,1) ;
		}
	}
	
	// 计算下级最小值
	if( item.hasClass('jc-frame') )
	{
		children.each(function(key,child){
			realthis.calculateMinMax( $(child) ) ;
		});
	}
	
	this.log(" ") ;
	this.log("计算 item "+item.attr('id')+"的空间要求：") ;
	
	// 基本规则 (for view)
	if( mapMVCMergerItemProperties[item[0].id]['width'] == '' )
	{
		item.data('min-width' , defaultMin);
		item.data('max-width' , -1);
	}
	else
	{
		item.data('min-width' , mapMVCMergerItemProperties[item[0].id]['width']);
		item.data('max-width' , mapMVCMergerItemProperties[item[0].id]['width']);
	}
	if( mapMVCMergerItemProperties[item[0].id]['height'] == '' )
	{
		item.data('min-height' , -1);
	}
	else
	{
		item.data('min-height' , mapMVCMergerItemProperties[item[0].id]['height']);
	}

	// 容器规则：最大值不可以小于 所有成员的最大值总和 (for frame)
	if( item.hasClass('jc-frame') ){
		
		var childrenMinWidth = 0 ;
		var childrenMinHeight = 0 ;
		
		children.each(function(v,child)
		{
			var nChildMinWidth = parseInt($(child).data('min-width')) ;
			var nChildMinHeight = parseInt($(child).data('min-height')) ;
			
			// 横向
			if( item.hasClass('jc-frame-horizontal') )
			{
				realthis.log("横向frame：累成员加宽，取最大成员高") ;
				
				// 累成员加宽
				childrenMinWidth += nChildMinWidth ;
				// 取最大成员高
				if( childrenMinHeight<nChildMinHeight )
				{
					childrenMinHeight = nChildMinHeight ;
				}
			}
			// 纵向
			else
			{
				realthis.log("纵向frame：取最大成员宽，累成员加高") ;
				
				// 取最大成员宽
				if( childrenMinWidth<nChildMinWidth )
				{
					childrenMinWidth = nChildMinWidth ;
				}
				// 累加成员高
				if( nChildMinHeight>0 )
				{
					childrenMinHeight += nChildMinHeight ;
				}
			}
		});
		
		if( item.data('min-width') < childrenMinWidth )
		{
			item.data('min-width' , childrenMinWidth );
		}
		if( childrenMinHeight>0 && item.data('min-height') < childrenMinHeight )
		{
			item.data('min-height' , childrenMinHeight );
		}

		// 还要加上自己的 panding,margin,border
		// todo ...
	}
	
	this.log( "min/max width:"+item.data('min-width')+"/"+item.data('max-width')+";  min height:"+item.data('min-height') );
}

/**
 * 为frame和view计算宽高
 */
MergerPannel.Layout.prototype.assignSpace = function(container)
{
	var $ = jquery;
	var realthis = this;
	var children = container.children('.jc-layout');
	
	//排除编辑控件自身
	for(var i=children.length-1;i>=0;i--)
	{
		if( children[i].id == 'MergePannelDialog-0' )
		{
			children.splice(i,1) ;
		}
	}

	var assignableWidth = container.width() ;
	var assignableHeight = container.height() ;
	// realthis.log( "总可用空间:"+assignableWidth+"/"+assignableHeight ) ;
	
	// 横向 frame
	if(container.hasClass('jc-frame-horizontal'))
	{
		// 横向 frame 按照 min-width 逆向排列成员
		children.sort(function(a,b){
			return $(b).data('min-width') - $(a).data('min-width');
		});
		
		children.each(function(key,item){

			// 剩余空间 不够一个item的最小值要求
			if( assignableWidth < $(item).data('min-width') )
			{
				throw new Error( "无法为layout item:"+$(item).attr('id')+"分配空间：item 要求的最小值("+$(item).data('min-width')+")超出了可以分配的空间("+assignableWidth+")" ) ;
			}
			
			// 未分配的item 平分 剩余空间
			var assignedWidth = Math.floor( assignableWidth / ( children.length - key ) ) ;
			realthis.log(container.id+" 目前可用空间:"+assignableWidth+"; 还剩"+(children.length - key)+"个item；平分："+assignedWidth);
			
			// 应用分配到的空间
			var assignedSpace = realthis.applySpace(item,assignedWidth,assignableHeight) ;
			
			// 剩余未分配空间
			assignableWidth -= assignedSpace.w ;
			
		});
	}
	
	// 纵向 frame
	else
	{
		// 纵向 frame 按照 min-height 逆向排列成员
		children.sort(function(a,b){
			return $(b).data('min-height') - $(a).data('min-height');
		});
				
		children.each(function(key,item)
		{
			// 剩余空间 不够一个item的最小值要求
			if( assignableWidth < $(item).data('min-width') )
			{
				throw new Error( "无法为layout item:"+$(item).attr('id')+"分配空间：item 要求的最小值("+$(item).data('min-width')+")超出了可以分配的空间("+assignableWidth+")" ) ;
			}
			
			// 未分配的item 平分 剩余空间
			var assignedHeight = Math.floor( assignableHeight / ( children.length - key ) ) ;
			realthis.log(assignedHeight) ;
			
			var assignedSpace = realthis.applySpace(item,assignableWidth,assignedHeight) ;

			// 剩余未分配空间
			assignableHeight -= assignedSpace.h ;
		});
	}
}

/**
 * 尝试将分配到的空间应用到元素上
 */
MergerPannel.Layout.prototype.applySpace = function(item,assignedWidth,assignedHeight)
{
	var $ = jquery;
	
	this.log(" ") ;
	this.log("开始分配 item "+$(item).attr('id')+"的空间：") ;
	
	
	// 分配宽度-----------------------------------
	
	// 分配值不够item要求的最小值
	if(  $(item).data('min-width') > assignedWidth )	
	{
		assignedWidth =  $(item).data('min-width') ;
	}
	// 分配值超出item限制的最大值
	else if( $(item).data('max-width')>=0 && $(item).data('max-width') < assignedWidth )	
	{
		assignedWidth =  $(item).data('max-width') ;
	}

	// 应用计算可行的 分配空间
	// this.log($(item).outerWidth()-$(item).width()+$(item).innerWidth()) ;
	var outer = parseInt($(item).css('border-left-width')) ;
	outer+= parseInt($(item).css('border-right-width')) ;
	outer+= parseInt($(item).css('padding-left')) ;
	outer+= parseInt($(item).css('padding-right')) ;
	outer+= parseInt($(item).css('margin-left')) ;
	outer+= parseInt($(item).css('margin-right')) ;
	var width = assignedWidth - outer ;

	this.log("item "+$(item).attr('id')+" 实际分配宽度："+assignedWidth+", 外部宽度："+outer+", 内部宽度："+width);
	
	$(item).width(width) ;
	
	this.log("item 最后生效的内部宽度："+$(item).width());
	
	
	// 分配高度-----------------------------------

	// 分配值不够item要求的最小值
	if(  $(item).data('min-height') > assignedHeight )	
	{
		assignedHeight =  $(item).data('min-height') ;
	}
	
	outer = parseInt($(item).css('border-top-width')) ;
	outer+= parseInt($(item).css('border-bottom-width')) ;
	outer+= parseInt($(item).css('padding-top')) ;
	outer+= parseInt($(item).css('padding-bottom')) ;
	outer+= parseInt($(item).css('margin-top')) ;
	outer+= parseInt($(item).css('margin-bottom')) ;
	var height = assignedHeight - outer ;

	this.log("item "+$(item).attr('id')+" 实际分配高度："+assignedHeight+", 外部高度："+outer+", 内部高度："+height);
	
	$(item).height(height) ;
	
	this.log("item 最后生效的内部高度："+$(item).height());

	
	// 递归分配item的下级
	if( $(item).hasClass('jc-frame') )
	{
		this.assignSpace( $(item) ) ;
	}
	
	return {"w":assignedWidth,"h":assignedHeight} ;
}
