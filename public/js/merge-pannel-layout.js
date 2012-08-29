MergerPannel.Layout = function() {
	this.arrZTreeRootNodes = [];
	this.aZtree = [];

	this.eleSelectedItem = null;
	this.dataSelectedItem = null;
	this.topFrame = new Array();
	
	// 从后端 setting 中取出上一次输入的属性值，用来恢复当前属性面板中的input (mapMVCMergerItemProperties)
	//key 是css属性名称,value是表单对应ID
	this.mapPropertyNames = {
		'width' : 'mergepannel-props-width',
		'height' : 'mergepannel-props-height',
		'skin' : 'mergepannel-props-skin',
		'class' : 'mergepannel-props-class',
		'display' : 'mergepannel-props-display',
		'background-image' : 'mergepannel-props-background-image',
		'background-color' : 'mergepannel-props-background-color',
		'background-position' : 'mergepannel-props-background-position',
		'background-repeat' : 'mergepannel-props-background-repeat',
		'position' : 'mergepannel-props-position',
		'z-index' : 'mergepannel-props-zindex',
		'top' : 'mergepannel-props-top',
		'left' : 'mergepannel-props-left',
		'bottom' : 'mergepannel-props-bottom',
		'right' : 'mergepannel-props-right',
		'border-top-width' : 'mergepannel-props-border-top-width',
		'border-top-color' : 'mergepannel-props-border-top-color',
		'border-top-style' : 'mergepannel-props-border-top-style',
		'border-bottom-width' : 'mergepannel-props-border-bottom-width',
		'border-bottom-color' : 'mergepannel-props-border-bottom-color',
		'border-bottom-style' : 'mergepannel-props-border-bottom-style',
		'border-right-width' : 'mergepannel-props-border-right-width',
		'border-right-color' : 'mergepannel-props-border-right-color',
		'border-right-style' : 'mergepannel-props-border-right-style',
		'border-left-width' : 'mergepannel-props-border-left-width',
		'border-left-color' : 'mergepannel-props-border-left-color',
		'border-left-style' : 'mergepannel-props-border-left-style',
		'margin-top' : 'mergepannel-props-margin-top',
		'margin-right' : 'mergepannel-props-margin-right',
		'margin-bottom' : 'mergepannel-props-margin-bottom',
		'margin-left' : 'mergepannel-props-margin-left',
		'padding-top' : 'mergepannel-props-padding-top',
		'padding-right' : 'mergepannel-props-padding-right',
		'padding-bottom' : 'mergepannel-props-padding-bottom',
		'padding-left' : 'mergepannel-props-padding-left',
		'style' : 'mergepannel-props-style'
	};
	
	//保留class名单
	this.keepClassNames = [
	     'jc-layout'
	     ,'jc-frame'
	     ,'jc-view'
	     ,'jc-frame-vertical'
	     ,'jc-frame-horizontal'
	     ,'jc-layout-item-vertical'
	     ,'jc-layout-item-horizontal'
	];

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
		//重新计算布局
		realThis.updateLayout();
	});
	$('#mergepannel-props-frame-clearheight-btn').click(function() {
		$(realThis.eleSelectedItem).children('.jc-layout').height('');
		//重新计算布局
		realThis.updateLayout();
	});
	$('#mergepannel-props-frame-autoheight-btn').click(function() {
		realThis.autoItemsHeight( realThis.eleSelectedItem , realThis.dataSelectedItem);
		//重新计算布局
		realThis.updateLayout();
	});
	$('#mergepannel-props-frame-center-btn').click(
			function() {
				$(realThis.eleSelectedItem).children('.jc-layout').toggleClass( 'place_center');
				//重新计算布局
				realThis.updateLayout();
			});
	$('#mergepannel-props-frame-delete-btn').click(
			function() {
				realThis.deleteFrame(realThis.eleSelectedItem, realThis.dataSelectedItem);
				//重新计算布局
				realThis.updateLayout();
			});
	$('#mergepannel-props-frame-new-btn').click(
			function() {
				realThis.addChildFrame(realThis.eleSelectedItem, realThis.dataSelectedItem);
				//重新计算布局
				realThis.updateLayout();
			});

	// 属性
	$('#mergepannel-props-common input').change(function(event) {
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
	
	//属性值扫描,解决第一次打开panel并保存后丢失属性的问题,顺便解决display的半透明treenode的特效 和 自定义宽高后的标记
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
	}
	//自动选中第一个
	$("#mergepannel-viewtree").find('a:first').click();
	
	//border 详细form
	$('#mergepannel-props-borders-showmore').toggle(function(){
		$(this).removeClass('mergepannel-props-borders-arrow-left').addClass('mergepannel-props-borders-arrow-down');
		$("#mergepannel-props-borders").show();
	},function(){
		$(this).removeClass('mergepannel-props-borders-arrow-down').addClass('mergepannel-props-borders-arrow-left');
		$("#mergepannel-props-borders").hide();
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
	
	//初始化nAssignedFrameId
	$('div.cusframe').each(function(v,b){
		var maxNum = $(b).attr('id').split('cusFrame-')[1] - 0;
		if(realThis.nAssignedFrameId <= maxNum)
		{
			realThis.nAssignedFrameId = maxNum+1;
		}
	});
	
	//"可填充容器"的选项
	$('#mergepannel-frame-autoFill').click(function(){
		if(!mapMVCMergerItemProperties[realThis.eleSelectedItem.id]){
			mapMVCMergerItemProperties[realThis.eleSelectedItem.id] = {};
		}
		mapMVCMergerItemProperties[realThis.eleSelectedItem.id]['autoFill'] = $(this)[0].checked;
		realThis.updateLayout();
	});
	
	//启动fselecter ,用来从dom选择treenode
	jQuery("#view_select_dom").live('click',function(){
		if(jQuery(this).hasClass("domToNode")){
			realThis.closeSelectDomMode();
		}else{
			realThis.openSelectDomMode();
		}
	});
	
	//有些node不可拖拽
	jQuery('.jc-layout').each(function(v,b){
		if(jquery(b).data('object')['inframe'] == false){
			jquery('#'+realThis.aZtree.getNodeByParam('id', b.id ).tId).find('a:first').css('cursor' , 'no-drop');
		}
	});
	
	//隐藏高级的css设置
	var dls = $('#mergepannel-showmore').parents('dl:first').nextAll('dl').hide();
	$('#mergepannel-showmore').toggle(function(){
		dls.show();
		$('#mergepannel-showmore')
			.removeClass("mergepannel-showmore-left")
			.addClass("mergepannel-showmore-down");
	},function(){
		dls.hide();
		$('#mergepannel-showmore')
			.removeClass("mergepannel-showmore-down")
			.addClass("mergepannel-showmore-left");
	});
	
	//自定义宽高的元素treenode上显示标记
	$(".jc-layout").each(function(v,b){
		realThis.changedSpaceTreeNode($('#'+b.id));
	});
	
	//保存皮肤(skin)
	$('#mergepannel-layout-saveToSkinBtn').click(function(){
		realThis.saveLayoutToSkin();
	});
	
	realThis.initSkinSelect(__arrSkins);
};

MergerPannel.Layout.prototype.openSelectDomMode = function(){
	jQuery("#view_select_dom").addClass("domToNode");
	//绑定选择dom的方法
	jQuery('div.jc-layout').on("mouseenter",{realThis:this},this.highLightDom);
	jQuery('div.jc-layout').on("click",{realThis:this},this.selectDomAndFindTag);
};
MergerPannel.Layout.prototype.closeSelectDomMode = function(){
	jQuery("#view_select_dom").removeClass("domToNode");
	//卸载选择dom的方法
	jQuery('div.jc-layout').off("mouseenter",this.highLightDom);
	jQuery('div.jc-layout').off("click",this.selectDomAndFindTag);
};
MergerPannel.Layout.prototype.highLightDom = function(e){
	jQuery(e.currentTarget).fselecter();
	jQuery('div.fselecter_highlight').mouseover(e.data.realThis.lowLightDom);
	e.stopPropagation();
};
MergerPannel.Layout.prototype.lowLightDom = function(e){
	jQuery('.fselecter_highlight_block').remove();
	e.stopPropagation();
};
MergerPannel.Layout.prototype.selectDomAndFindTag = function(e){
	var sId = e.currentTarget.id;
	
	jQuery('.fselecter_highlight_block').remove();
	e.data.realThis.closeSelectDomMode();
	
	e.data.realThis.aZtree.selectNode(e.data.realThis.aZtree.getNodeByParam('id', sId ));
	
	e.stopPropagation();
	return false;
};

MergerPannel.Layout.prototype.isAutoFill = function(aFrame){
	if(!aFrame || aFrame.length === 0){
		return;
	}
	if(mapMVCMergerItemProperties[aFrame[0].id]['autoFill'] === 'true'
		|| mapMVCMergerItemProperties[aFrame[0].id]['autoFill'] === true){
		return true;
	}else{
		return false;
	}
};

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
							beforeDrop : function(treeId, treeNodes,targetNode, moveType) {
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
								//重新计算布局
								realThis.updateLayout();
							}

							// 点击 frame/view ，打开旁边的属性界面
							,
							onClick : function(event, treeId, treeNode) {
//								// 应用上一次打开的属性表单
//								if (realThis.eleSelectedItem != null) {
//									realThis.applyProperties();
//								}
								
								realThis.eleSelectedItem = document.getElementById(treeNode.id);
								realThis.dataSelectedItem = treeNode;
								realThis.openProperty(treeNode,realThis.eleSelectedItem);
							}
						}
					}, this.arrZTreeRootNodes);
	

	// 全部展开
	this.aZtree.expandAll(true);
	
	//隐藏编辑面板自身节点
//	jquery( "#" + this.aZtree.getNodeByParam('id', 'mvc_merger_MergePannelDialog_html-0' )['tId'] ).hide();
	
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
							var item = $('#' + aNode.id);
//							item.fselecter();
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
//							jQuery('.fselecter_highlight_block').remove();
							$('#mergepannel-layout-flashing').remove();
						}
					});
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
 * 保存皮肤(skin)
 */
MergerPannel.Layout.prototype.saveLayoutToSkin = function() {
	var $ = jquery;
	var realThis = this;
	var selectEle = realThis.eleSelectedItem;
	var aNode = realThis.dataSelectedItem;
	if (!aNode) {
		return;
	}
	
	//class 和  skin
	var skinAndClass = '';
	
	if( $('#'+selectEle.id).attr('class') ){
		skinAndClass = $('#'+selectEle.id).attr('class').split(' ');
	}
	if(skinAndClass == ''){
		skinAndClass = [];
	}

	var aLayoutItem = {
		type : aNode.type,
		id : selectEle.id,
		cssClass : skinAndClass,
		style : $(selectEle).attr("style"),
		items : [],
		xpath : $('#'+selectEle.id).attr('xpath')
	};

	// frame 类型
	if (aNode.type == 'frame') {
		aLayoutItem.layout = aNode.layout;
	}
	
	//自定义frame?
	if( aNode.id.split('cusFrame').length > 1 ){
		aLayoutItem['customFrame'] = true;
	}
	
	var skinName = prompt('请输入皮肤名称');
	if(!skinName){
		$('#mergepannel-skin-msgqueue').html('皮肤名称不能为空');
		setTimeout(function(){$('#mergepannel-skin-msgqueue').html('')} , 3000);
		return;
	}

	$.ajax({
		type : "POST",
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=noframe&a[]=/merger.PostViewLayoutSetting::saveToSkin',
		data : {
			title        : skinName
			, properties : mapMVCMergerItemProperties[selectEle.id]
		},
		complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-skin-msgqueue').html(req.responseText);
			setTimeout(function(){$('#mergepannel-skin-msgqueue').html('')} , 3000);
			// 重新计算ui布局(消息队列可能影响ui界面)
			realThis.resizeDialog();
		}
	});
}
/**
 * 删除皮肤
 */
MergerPannel.Layout.prototype.deleteSkin = function(sSkinName) {
	var $ = jquery;
	$.ajax({
		type : "POST",
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=noframe&a[]=/merger.PostViewLayoutSetting::deleteSkin',
		data : {
			title        : sSkinName
		}
		, beforeSend:function(){
			if(!confirm('确定要删除皮肤"'+sSkinName+'"吗?')){
				return false;
			}
		}
		, complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-skin-msgqueue').html(req.responseText);
			setTimeout(function(){$('#mergepannel-skin-msgqueue').html('')} , 3000);
		}
	});
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
	$('.jc-layout')
	.not('#mvc_merger_MergePannelDialog_html-0')
	.each(function() {
		var aNode = realThis.getDataByEleId(this.id);
		if (!aNode) {
			return;
		}
		
		//class 和  skin
		var skinAndClass = '';
		
		if( $('#'+this.id).attr('class') ){
			skinAndClass = $('#'+this.id).attr('class').split(' ');
		}
		if(skinAndClass == ''){
			skinAndClass = [];
		}

		var aLayoutItem = {
			type : aNode.type,
			id : this.id,
			cssClass : skinAndClass,
			style : $(this).attr("style"),
			items : [],
			xpath : $('#'+this.id).attr('xpath')
		};

		// frame 类型
		if (aNode.type == 'frame') {
			aLayoutItem.layout = aNode.layout;
		}
		
		//自定义frame?
		if( aNode.id.split('cusFrame').length > 1 ){
			aLayoutItem['customFrame'] = true;
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
		//配置作用方式
	var sParams = $("#mergepannel-layout-save-parmas").val().replace(/&/g,'@').replace(/=/g,'^');
	if(sParams == '' || $("#mergepannel-layout-saveType").val() == 'type'){
		sParams = '*';
	}
	
	$.ajax({
		type : "POST",
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=noframe&a[]=/merger.PostViewLayoutSetting::save',
		data : {
			layout : mapRootNodes
			, controller : sMvcMergerController
			, properties : mapMVCMergerItemProperties
			, requestparams : sParams
		},
		beforeSend : function(){
			$('#mergepannel-layout-msgqueue').html('<div style="height:26px;line-height:26px">保存中...</div>');
		},
		complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-layout-msgqueue').html(req.responseText);
			setTimeout(function(){$('#mergepannel-layout-msgqueue').html('')} , 5000);
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
		url : '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&rspn=msgqueue&a[]=/merger.PostViewLayoutSetting::clean',
		data : {
			controller : sMvcMergerController
			, requestparams : sParams
		},
		beforeSend : function(){
			$('#mergepannel-layout-msgqueue').html('<div style="height:26px;line-height:26px">清理中...</div>');
		},
		complete : function(req) {
			// 显示操作结果消息队列
			$('#mergepannel-layout-msgqueue').html(req.responseText);
			setTimeout(function(){$('#mergepannel-layout-msgqueue').html('')} , 5000);
			// 重新计算ui布局(消息队列可能影响ui界面)
			realThis.resizeDialog();
			
			if(confirm('是否刷新页面以查看改动')){
				location.reload();
			}
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
			- 26 //选择按钮的高度
	);
}

/**
 * 移动 frame/view 到另一个 frame 内 参数 view, frame 都是 html div 元素 将 view 移动到 frame 里面
 */
MergerPannel.Layout.prototype.moveIn = function(view, frame) {
	var $ = jquery;
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
	var $ = jquery;
	$(view).insertBefore($(behindItem));
	// frame 重新布局
	this.layoutFrame(behindItem.parentNode);
};
/**
 * 移动 frame/view 到另一个 frame/view 前面 参数 view, frame 都是 html div 元素 将 view 移动到
 * frontItem 的后面
 */
MergerPannel.Layout.prototype.moveAfter = function(view, frontItem) {
	var $ = jquery;
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
	
	//因为改变了元素的class,这里重新获取表单,以保持class表单内容的同步
	$('#'+aNode.tId+ " >a").click();

	this.updateLayout(function(){
		realthis.setFrameLayout(frame,oldLayout);
		this.updateLayout();
	});
	
	// 这里有一个 bug ，在 ie下，一定要执行两遍 updateLayout() ， 否则计算错误导致成员的宽度超出 横向frame的宽度，出现挤换行
	this.updateLayout() ;
};
MergerPannel.Layout.prototype.layoutFrame = function(frame, node) {
	var $ = jquery;
	
	if (typeof node === 'undefined') {
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
	$(frame).addClass( MergerPannel.Layout.mapLayoutFrameStyles[sLayout] );
	
	if(typeof mapMVCMergerItemProperties[frame.id] == 'undefined'){
		mapMVCMergerItemProperties[frame.id] = {};
	}
	mapMVCMergerItemProperties[frame.id]['class'] = $(frame).attr('class');
	
	$(frame).children('.jc-layout').each(function(v,b){
		$(b).addClass( MergerPannel.Layout.mapLayoutItemStyles[sLayout] );
		if(!mapMVCMergerItemProperties[b.id]){
			mapMVCMergerItemProperties[b.id] = {};
		}
		mapMVCMergerItemProperties[b.id]['class'] = $(b).attr('class');
	});
	
	//底部clear:both
	var endDiv = $(frame).find('>.jc-layout-item-end');
	if(sLayout == 'v'){
		if(endDiv.length > 0){
			endDiv.remove();
		}
	}else{
		if(endDiv.length == 0){
			$(frame).append('<div class="jc-layout-item-end" style="height:0px;"></div>');
		}
	}
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
	var realthis = this;
	var aChildren = $(frame).children('.jc-layout');
	var nHeight = 0;
	if (node.layout === 'h') {
		aChildren.each(function(v,b){
			if( $(b).outerHeight(true)  > nHeight){
				nHeight = $(b).outerHeight(true);
			}
		});
	} 
//	else if (node.layout === 'v') {
//		if (aChildren.size() < 1) {
//			return;
//		}
//		nHeight = Math.floor($(frame).height() / aChildren.size());
//	}
	aChildren.each(function(v,b){
		var borderheight = nHeight - ($(b).outerHeight(true) - $(b).height() ); 
		$(b).height(borderheight);
		mapMVCMergerItemProperties[b.id]['height'] = borderheight;
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
		$('#mergepannel-props-frame-' + itemData.layout).attr('checked', true);

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
 * 显示选中的 frame/view 对应属性表单值 (还原表单)
 */
MergerPannel.Layout.prototype.updateProperties = function() {
	var $ = jquery;
	var realThis = this;
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
	
	//autoFill  自动填充frame
	$("#mergepannel-frame-autoFill").get(0).checked = false;
	if(typeof (mapMVCMergerItemProperties[sId]) != 'undefined'
		&& typeof (mapMVCMergerItemProperties[sId]['autoFill']) != 'undefined'){
		if(mapMVCMergerItemProperties[sId]['autoFill']==='true'
			|| mapMVCMergerItemProperties[sId]['autoFill']===true){
			$("#mergepannel-frame-autoFill").attr('checked',true);
		}
	}
	
	//border , 从元素中提取样式
	$('.mergepannel-border').each(function(v,b){
		if(b.nodeName == 'INPUT'){
			$(b).val('');
		}else{
			$(b).val('none');
		}
	});
	var arrPositons = ['top','bottom','left','right'];
	for(var nPKey in arrPositons){
		$('#mergepannel-props-border-'+arrPositons[nPKey]+'-width').val( $('#'+sId).css('border-'+arrPositons[nPKey]+'-width').split('px')[0] );
		$('#mergepannel-props-border-'+arrPositons[nPKey]+'-color').val( colorRGBToHex($('#'+sId).css('border-'+arrPositons[nPKey]+'-color')) );
		$('#mergepannel-props-border-'+arrPositons[nPKey]+'-style').val( $('#'+sId).css('border-'+arrPositons[nPKey]+'-style') );
	}
	
	function colorRGBToHex(color){
	　　var regexpRGB=/^(rgb|RGB)\([0-9]{1,3},\s?[0-9]{1,3},\s?[0-9]{1,3}\)/;//RGB
	　　if(regexpRGB.test(color)){
	　　　　color=color.replace(/((|)|rgb|RGB)*/g,"").split(",");
	　　　　var colorHex="#";
	　　　　for(var i=0;i<color.length;i++){
				if(i==0){
					color[i] = color[i].substr(1);
				}
				if(i==2){
					color[i] = color[i].split(')')[0];
				}
				var hex=Number(color[i]).toString(16);
				if(hex.length==1){
					hex="0"+hex;
				}
	　　　　　　colorHex+=hex;
	　　　　}
	　　　　return colorHex;
	　　}else{
	　　　　return color;
	　　}
	}

	//保留class的保存,防止用户指定class时勿删
	var arrClasses = $(this.eleSelectedItem).attr('class').split(' ');
	var arrToFormInput = [];
	var arrToFormInputParams = [];
	for ( var nClass in arrClasses) {
		//是用户指定的class? 如果是放入表单,不是就放入表单备用值中
		if( $.inArray( arrClasses[nClass] , realThis.keepClassNames) === -1 ){
			arrToFormInput.push( arrClasses[nClass] );
		}else{
			arrToFormInputParams.push( arrClasses[nClass] );
		}
	}
	$.unique(arrToFormInput);
	$.unique(arrToFormInputParams);
	$('#mergepannel-props-class').val(arrToFormInput.join(' '));
	$('#mergepannel-props-class').attr('otherClass',arrToFormInputParams.join(' '));
	
	//还原skin列表的值
	//TODO
}

/*
 * 初始化skin列表
 */
MergerPannel.Layout.prototype.initSkinSelect = function(arrSkins) {
	var $ = jquery;
	$('#mergepannel-props-skin').html('<option value="">自定义</option>');
	for(var skinName in arrSkins){
		$('#mergepannel-props-skin').append( "<option value='" + skinName + "'>" + skinName + "</option>");
	}
}

/*
 * 自定义宽高以后treenode的样式
 */
MergerPannel.Layout.prototype.changedSpaceTreeNode = function(frame) {
	var realThis = this;
	var $ = jquery;
	var sId= frame[0].id;
	var node = $('#'+realThis.aZtree.getNodesByParam("id",sId)[0]['tId']);
//	if(sId == 'opencms_TopList_html-0'){
//		console.log(typeof mapMVCMergerItemProperties != 'undefined');
//		console.log(typeof mapMVCMergerItemProperties[sId] != 'undefined');
//		console.log(mapMVCMergerItemProperties[sId]['width'] != '');
//		console.log(mapMVCMergerItemProperties[sId]['height'] != '');
//	}
	if( typeof mapMVCMergerItemProperties != 'undefined'
		&& typeof mapMVCMergerItemProperties[sId] != 'undefined'
		&& ( mapMVCMergerItemProperties[sId]['width'] != '' || mapMVCMergerItemProperties[sId]['height'] != '')
	){
//		if(sId == 'opencms_TopList_html-0'){
//			console.log(node);
//			console.log(node.find('> a'));
//		}
		node.find('.changedStar').remove();
		node.find('> a').prepend('<span class="changedStar">*</span>');
	}else{
		node.find('.changedStar').remove();
	}
}

/**
 * 将属性表单中的值应用到 frame/view 上
 */
MergerPannel.Layout.prototype.applyProperties = function(event) {
	var $ = jquery;
	var realthis = this;
	
	if( typeof event == 'undefined' ){
		return;
	}
	
	//class 处理
	var oldClass = $(realthis.eleSelectedItem).attr('class');
	var otherClasses = $('#mergepannel-props-class').attr('otherclass');
	if(!otherClasses){
		otherClasses = '';
	}
	$(realthis.eleSelectedItem).attr( 'class', $('#mergepannel-props-class').val() + " " + otherClasses);
	realthis.updateLayout(function(){
		$(realthis.eleSelectedItem).attr( 'class', oldClass);
		$('#mergepannel-props-class').change();
	});
	
	switch( event.currentTarget.id ){
		//width height 的特殊处理,这里避免框架上出现auto宽度和高度,并计算jc-layout的最小宽高最大宽高
		case 'mergepannel-props-width' :
		case 'mergepannel-props-height' :
			if(typeof mapMVCMergerItemProperties != 'undefined'){
				var type = event.currentTarget.id.split('-')[2];
				var oldValue = realthis.getMapMVCMergerItemProperties(realthis.eleSelectedItem.id , type);
				
				mapMVCMergerItemProperties[realthis.eleSelectedItem.id][type] = $("#"+event.currentTarget.id).val();
				
				realthis.log("变值 updateLayout");
				
				if(type == 'width'){
					var newWidth = $('#'+realthis.mapPropertyNames[type]).val()
						- ($(realthis.eleSelectedItem).outerWidth(true) - $(realthis.eleSelectedItem).width());
					if(newWidth && newWidth > 0){
						$(realthis.eleSelectedItem).width( newWidth );
					}
				}else{
					var newHeight = $('#'+realthis.mapPropertyNames[type]).val()
					- ($(realthis.eleSelectedItem).outerHeight(true) - $(realthis.eleSelectedItem).height());
					if(newHeight && newHeight > 0){
						$(realthis.eleSelectedItem).height(newHeight);
					}
				}
				
				realthis.updateLayout(function(){
					mapMVCMergerItemProperties[realthis.eleSelectedItem.id][type] = oldValue;
					$("#"+event.currentTarget.id).val(oldValue).change();
				});
				
				realthis.changedSpaceTreeNode($(realthis.eleSelectedItem));
			}
			break;
			
		//换皮肤,应用皮肤所有的属性到表单中
		case 'mergepannel-props-skin' :
			var properties = __arrSkins[$(event.currentTarget).val()];
			for(var property in properties){
				$('#'+realThis.mapPropertyNames[property]).val(properties[property]).change();
			}
			break;
			
		//display特殊处理 , 如果结果为"隐藏",则半透明treenode
		case 'mergepannel-props-display' :
			if(typeof mapMVCMergerItemProperties != 'undefined'){
				if($(event.currentTarget).val() == 'none'){
					$("#mergepannel-viewtree").find('.curSelectedNode').parent('li').animate({opacity:'0.5'},0);
				}else{
					$("#mergepannel-viewtree").find('.curSelectedNode').parent('li').animate({opacity:'1'},0);
				}
				
				$(realthis.eleSelectedItem).css( 'display' , $(event.currentTarget).val() );
				
				realthis.updateLayout(function(){
					$("#mergepannel-props-display").val( realthis.getMapMVCMergerItemProperties(realthis.eleSelectedItem.id , 'display')).change();
				});
				
				realthis.saveProperties();
			}
			break;
			
		//border 特殊处理
		case 'mergepannel-props-border-width' :
			$('#mergepannel-props-border-top-width').val($(event.currentTarget).val()).trigger('change');
			$('#mergepannel-props-border-left-width').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-right-width').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-bottom-width').val($(event.currentTarget).val()).change();
			break;
		case 'mergepannel-props-border-top-width' :		
		case 'mergepannel-props-border-left-width' :		
		case 'mergepannel-props-border-right-width' :		
		case 'mergepannel-props-border-bottom-width' :
			var propertyName = event.currentTarget.id.split('mergepannel-props-')[1];
			$(realthis.eleSelectedItem).css( propertyName , $(event.currentTarget).val() );
			
			realthis.updateLayout(function(){
				$(event.currentTarget).val(realthis.getMapMVCMergerItemProperties( realthis.eleSelectedItem.id , propertyName) ).change();
			});
			
			realthis.saveProperties();
			
			break;
		case 'mergepannel-props-border-color' :
			$('#mergepannel-props-border-top-color').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-left-color').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-right-color').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-bottom-color').val($(event.currentTarget).val()).change();
			break;
		case 'mergepannel-props-border-top-color' :
		case 'mergepannel-props-border-left-color' :
		case 'mergepannel-props-border-right-color' :
		case 'mergepannel-props-border-bottom-color' :
			var propertyName = event.currentTarget.id.split('mergepannel-props-')[1];
			
			$(realthis.eleSelectedItem).css( propertyName , $(event.currentTarget).val() );
			
			realthis.saveProperties();
			
			break;
		case 'mergepannel-props-border-style' :
			$('#mergepannel-props-border-top-style').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-left-style').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-right-style').val($(event.currentTarget).val()).change();
			$('#mergepannel-props-border-bottom-style').val($(event.currentTarget).val()).change();
			break;
		case 'mergepannel-props-border-top-style' :
		case 'mergepannel-props-border-left-style' :
		case 'mergepannel-props-border-right-style' :
		case 'mergepannel-props-border-bottom-style' :
			var propertyName = event.currentTarget.id.split('mergepannel-props-')[1];
			
			$(realthis.eleSelectedItem).css( propertyName , $(event.currentTarget).val() );
			
			realthis.saveProperties();
			
			break;
			
		case 'mergepannel-props-background-repeat' :
			if( $(event.currentTarget).val() != 'no-repeat'){
				$(realthis.eleSelectedItem).css( 'background-repeat' , $(event.currentTarget).val() );
			}
			
			realthis.saveProperties();
			break;
		
		case 'mergepannel-props-margin-top' :
		case 'mergepannel-props-margin-right' :
		case 'mergepannel-props-margin-bottom' :
		case 'mergepannel-props-margin-left' :
		case 'mergepannel-props-padding-top' :
		case 'mergepannel-props-padding-right' :
		case 'mergepannel-props-padding-bottom' :
		case 'mergepannel-props-padding-left' :
			var propertyName = event.currentTarget.id.split('mergepannel-props-')[1];
			$(realthis.eleSelectedItem).css( propertyName , $(event.currentTarget).val() );
			
			realthis.updateLayout(function(){
				$(event.currentTarget).val( realthis.getMapMVCMergerItemProperties( realthis.eleSelectedItem.id , propertyName )).change();
			});
			
			realthis.saveProperties();
			break;
		
		case 'mergepannel-props-position' :
			if( $(event.currentTarget).val() != 'static' ){
				$(realthis.eleSelectedItem).css( 'position' , $(event.currentTarget).val() );
				
				realthis.updateLayout(function(){
					$(event.currentTarget).val( realthis.getMapMVCMergerItemProperties( realthis.eleSelectedItem.id , 'position' )).change();
				});
			}
			realthis.saveProperties();
			break;
			
		case 'mergepannel-props-style' :
			var oldStyle=$(realthis.eleSelectedItem).attr('style');
			
			//额外的style , 保持在style属性最后面
			$(realthis.eleSelectedItem).attr('style' ,  oldStyle + ' ' + $('#mergepannel-props-style').val() );
			realthis.updateLayout(function(){
				$(realthis.eleSelectedItem).attr('style' ,  oldStyle );
			});
			
			realthis.saveProperties();
			
			break;
			
		default:
			var propertyName = event.currentTarget.id.split('mergepannel-props-')[1];
			$(realthis.eleSelectedItem).css( propertyName , $(event.currentTarget).val() );
			realthis.saveProperties();
	}
}

/**
 * 清理表单
 */
MergerPannel.Layout.prototype.cleanProperties = function() {
	var $ = jquery;
	var realthis = this;
	
	for(var property in realThis.mapPropertyNames ){
		if(property == 'skin'){// || property == 'class'){
			continue;
		}
		
		$('#'+realThis.mapPropertyNames[property]).val("").change();
	}
}

/**
 * 将用户输入的属性值，保存在变量 mapMVCMergerItemProperties 中
 */
MergerPannel.Layout.prototype.saveProperties = function(sId) {
	var $ = jquery;
	var realthis = this;
	// 保存视图布局时，会将 mapMVCMergerItemProperties 提交给后端PHP，并保存到 setting 里，用于下一次编辑时显示
	sId = realthis.eleSelectedItem.id;
	if (typeof (mapMVCMergerItemProperties[sId]) == 'undefined') {
		mapMVCMergerItemProperties[sId] = {};
	}
	
	for( var propertyName in this.mapPropertyNames){
		mapMVCMergerItemProperties[sId][propertyName] = $('#'+this.mapPropertyNames[propertyName]).val();
	}
}

/**
 * 导出skin
 * return base64
 */
MergerPannel.Layout.prototype.exportSkin = function(sSkinName) {
	return jquery.base64Encode( jquery.toJSON(__arrSkins[sSkinName]) );
}

/**
 * 导入skin
 */
MergerPannel.Layout.prototype.importSkin = function(sBase64) {
	jquery.evalJSON( jquery.base64Decode( sBase64 ) );
}

/**
 * 删除一个frame（只有用户添加的frame可以被删除）
 */
MergerPannel.Layout.prototype.deleteFrame = function(itemEle, itemData) {
	var $ = jquery;
	if ($(itemEle).children('.jc-layout').size()) {
		alert('请先移除布局框架下的成员，再删除布局框架。');
		return;
	}
	$(itemEle).remove();
	this.aZtree.removeNode(itemData);
	delete mapMVCMergerItemProperties[itemEle.id];
	$("#mergepannel-viewtree").find('a').first().click();
}
/**
 * 添加一个下级frame
 */
MergerPannel.Layout.prototype.addChildFrame = function(itemEle, itemData) {
	var $ = jquery;
	var sEleId = 'cusFrame-' + (this.nAssignedFrameId++);

	var newNode = this.aZtree.addNodes(itemData, {
		// ztree的属性
		name : '布局框架:竖',
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
	//位置
	if(itemData['children'].length == 1){
		//那一个child是自身,什么也不做
	}else if(itemData['children'].length > 1){
		//把自己放在所有子元素前面
		this.aZtree.moveNode(itemData['children'][0],newNode[0],'prev');
	}else{
		//do nothing
	}
	
	// 创建html元素
	var aNewFrame = $("<div id=\""
							+ sEleId
							+ "\" class=\"jc-layout jc-frame cusframe\"><div class=\"jc-layout-item-end\"></div></div>");
	$(itemEle).prepend( aNewFrame );
	
	aNewFrame.attr('xpath', aNewFrame.parents('.jc-frame:first').attr('xpath') + '/' + sEleId );
	
	return newNode;
}
MergerPannel.Layout.prototype.log = function(msg)
{
	if( !jquery('#mergepannel-log-enable').attr('checked') )
	{
		return ;
	}
	if(typeof console == 'object')
	{
		console.log(msg);
	}
	jquery('#mergepannel-log-output').append(msg+"<br />\r\n") ;
};
















////////////////////////////////////////////////////////////////////////////////////////////////////////////

MergerPannel.Layout.prototype.updateLayout = function(resetFun)
{
	var realthis = this ;
	
	try{
		jquery('.jc-layout').each(function(v,b){
			if( !jquery(b).parent().hasClass('jc-frame') )
			{
				// 先计算分配宽度
				realthis.calculateMinMax( jquery(b), MergerPannel.Layout.flag_width );
				realthis.assignSpace( jquery(b), MergerPannel.Layout.flag_width );

				// 确定宽度后，将视图的auto高度做为最小高度，然后计算分配高度
				realthis.calculateMinMax( jquery(b), MergerPannel.Layout.flag_height );
				realthis.assignSpace( jquery(b), MergerPannel.Layout.flag_height );
			}
		});
	}catch(e){
		realthis.log(e.message);
		//回滚
		if( typeof resetFun == "function" ){
			 resetFun();
		}
	}
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
MergerPannel.Layout.flag_width = 1 ;
MergerPannel.Layout.flag_height = 2 ;
MergerPannel.Layout.prototype.calculateMinMax = function(item,flag) {
	var $ = jquery;
	var realthis = this;
	var defaultMin = 50 ;

	var children = item.children('.jc-layout') ;
	this.filterChildren(children) ;
	// 计算下级最小值
	if( item.hasClass('jc-frame') )
	{
		children.each(function(key,child){
			realthis.calculateMinMax( $(child), flag ) ;
		});
	}
	
	this.log(" ") ;
	this.log("计算 item "+item.attr('id')+"的空间要求("+flag+")：") ;
	
	// 基本规则 (for view)
	if( flag&MergerPannel.Layout.flag_width )
	{
		var nCusWidth = realthis.getMapMVCMergerItemProperties( item[0].id , 'width' ) ;
		if( nCusWidth == '' )
		{
			item.data('min-width' , defaultMin);
			item.data('max-width' , -1);
		}
		else
		{
			item.data('min-width' , nCusWidth);
			item.data('max-width' , nCusWidth);
		}
	}
	
	if( flag&MergerPannel.Layout.flag_height )
	{
		var nCusHeight = realthis.getMapMVCMergerItemProperties( item[0].id , 'height' ) ;
		if( nCusHeight == '' )
		{
			item.data('min-height',item.height('').outerHeight(true));
			item.data('max-height', -1);
		}
		else
		{
			item.data('min-height' , nCusHeight);
			item.data('max-height' , nCusHeight);
		}
	}

	if( item.hasClass('jc-frame-horizontal') )
	{
		this.log("横向frame：累加成员宽，取最大成员高") ;
	}
	else
	{
		this.log("纵向frame：取最大成员宽，累加成员高 / "+flag) ;
	}
	
	// 容器规则：最大值不可以小于 所有成员的最大值总和 (for frame)
	if( item.hasClass('jc-frame') ){
		
		var childrenMinWidth = 0 ;
		var childrenMinHeight = 0 ;
		children.each(function(v,child)
		{
			var nChildMinWidth = parseInt($(child).data('min-width')) ;
			var nChildMinHeight = parseInt($(child).data('min-height')) ;
//			console.log($(child) ,$(child).data('min-height') );
			
			realthis.log("child id："+child.id+": "+nChildMinWidth+"x"+nChildMinHeight) ;
			
			// 横向
			if( item.hasClass('jc-frame-horizontal') )
			{				
				// 累成员加宽
				if( flag&MergerPannel.Layout.flag_width )
				{
					childrenMinWidth += nChildMinWidth ;
				}
				// 取最大成员高
				if( flag&MergerPannel.Layout.flag_height && childrenMinHeight<nChildMinHeight )
				{
					childrenMinHeight = nChildMinHeight ;
				}
			}
			// 纵向
			else
			{				
				// 取最大成员宽
				if( flag&MergerPannel.Layout.flag_width && childrenMinWidth<nChildMinWidth )
				{
					childrenMinWidth = nChildMinWidth ;
				}
				// 累加成员高
				if( flag&MergerPannel.Layout.flag_height && nChildMinHeight>0 )
				{
					childrenMinHeight += nChildMinHeight ;
				}
			}
		});

		// 加上自己的 panding,margin,border
		childrenMinWidth+= item.outerWidth(true) - item.width() ;
		childrenMinHeight+= item.outerHeight(true) - item.height() ;
		// 重新设置 item 的 min/max
		if( flag&MergerPannel.Layout.flag_width & item.data('min-width') < childrenMinWidth )
		{
			item.data('min-width' , childrenMinWidth );
		}
		this.log("最小高："+item.data('min-height')) ;
		this.log("成员最小高之和："+childrenMinHeight) ;
		if( flag&MergerPannel.Layout.flag_height && childrenMinHeight>0 && item.data('min-height') < childrenMinHeight )
		{
			this.log("最小高小于成员最小高之和："+childrenMinHeight) ;
			item.data('min-height' , childrenMinHeight );
		}
	}
	if(flag&MergerPannel.Layout.flag_width)
	{
		this.log( "min/max width:"+item.data('min-width')+"/"+item.data('max-width') );
	}
	if(flag&MergerPannel.Layout.flag_height)
	{
		this.log( " min height:"+item.data('min-height') );
	}
}

/**
 * 为frame和view计算宽高
 */
MergerPannel.Layout.prototype.assignSpace = function(container,flag)
{
	var $ = jquery;
	var realthis = this;

	var children = container.children('.jc-layout');
	this.filterChildren(children) ;
	
	if(flag==MergerPannel.Layout.flag_width)
	{
		var assignable = container.width() ;
		var minKey = 'min-width' ;
		var bSameSpace = container.hasClass('jc-frame-vertical') ;
		var bExpandable = false ;											// 不允许扩张
		var bTottingup = container.hasClass('jc-frame-horizontal') ;		// 是否累加成员的空间
		var bChildSpaceAuto = !container.hasClass('jc-frame-horizontal') ;	// 允许使用 auto
	}
	else
	{
		var assignable = container.height() ;
		var minKey = 'min-height' ;
		var bExpandable = true ;										// 允许扩张
		var bTottingup = container.hasClass('jc-frame-vertical') ;		// 是否累加成员的空间
		if(this.isAutoFill(container))
		{
			var bChildSpaceAuto = false ;	// 允许使用 auto	
			var bSameSpace = container.hasClass('jc-frame-horizontal') ;		
		}
		else
		{
			var bChildSpaceAuto = true ;	// 允许使用 auto	
			var bSameSpace = false ;
		}
	}
	
	// 所有下级成员空间相同
	if( bSameSpace )
	{
		children.each(function(key,item){
			realthis.applySpace(item,assignable,flag,bChildSpaceAuto) ;
		}) ;
	}
	
	// 下级成员平分空间
	else
	{
		// 横向 frame 按照 min值 逆向排列成员
		children.sort(function(a,b){
			return $(b).data(minKey) - $(a).data(minKey);
		});
		
		var remain = assignable ;
		
		children.each(function(key,item){

			// 剩余空间 不够一个item的最小值要求
			if( !bExpandable && remain < $(item).data(minKey) )
			{
				throw new Error( "无法为layout item:"+$(item).attr('id')+"分配空间：item 要求的最小值("+$(item).data(minKey)+")超出了可以分配的空间("+remain+")" ) ;
			}
			
			// 未分配的item 平分 剩余空间
			var assigned = Math.floor( remain / ( children.length - key ) ) ;
			realthis.log(container.attr('id')+" 目前可用空间:"+remain+"; 还剩"+(children.length - key)+"个item；平分："+assigned);
			
			// 应用分配到的空间
			remain-= realthis.applySpace(item,assigned,flag,bChildSpaceAuto) ;
		});
	}
}

/**
 * 尝试将分配到的空间应用到元素上
 */
MergerPannel.Layout.prototype.applySpace = function(item,assigned,flag,bSpaceAuto)
{
	var $ = jquery;
	
	this.log(" ") ;
	this.log("开始分配 item "+$(item).attr('id')+"的空间 ("+flag+")：") ;
	
	
	// 分配宽度-----------------------------------
	if(flag&MergerPannel.Layout.flag_width)
	{
		// 分配值不够item要求的最小值
		if(  $(item).data('min-width') > assigned )	
		{
			assigned =  $(item).data('min-width') ;
		}
		// 分配值超出item限制的最大值
		else if( $(item).data('max-width')>=0 && $(item).data('max-width') < assigned )	
		{
			assigned =  $(item).data('max-width') ;
		}
		else if(bSpaceAuto)
		{
			assigned = 'auto' ;
		}
		
	
		// 应用计算可行的 分配空间	
		if( assigned==='auto' )
		{
			$(item).width(assigned) ;
		}
		else
		{
			var outer = $(item).outerWidth(true) - $(item).width() ;
			var width = assigned - outer ;
		
			this.log("item "+$(item).attr('id')+" 实际分配宽度："+assigned+", 外部宽度："+outer+", 内部宽度："+width);

			$(item).width(width) ;
			
			this.log("item 最后生效的内部宽度："+$(item).width());
		}
	}
	
	// 分配高度-----------------------------------
	if(flag&MergerPannel.Layout.flag_height)
	{
		if( bSpaceAuto && $(item).data('max-height')<0 )
		{
			this.log("item "+$(item).attr('id')+" 高度：auto");
			$(item).height('') ;
			
			assigned = $(item).outerHeight(true) ;

			this.log("item "+$(item).attr('id')+"最后生效的内部高度："+assigned);
		}
		else
		{
			// 分配值不够item要求的最小值
			if(  $(item).data('min-height') > assigned )	
			{
				assigned =  $(item).data('min-height') ;
			}
			
			outer = $(item).outerHeight(true) - $(item).height() ;
			var height = assigned - outer ;
			
			this.log("item "+$(item).attr('id')+" 实际分配高度："+assigned+", 外部高度："+outer+", 内部高度："+height);

			$(item).height(height) ;
			
			this.log("item "+$(item).attr('id')+"最后生效的内部高度："+$(item).height());
		}
		
	}

	// 递归分配item的下级
	if( $(item).hasClass('jc-frame') )
	{
		this.assignSpace( $(item), flag ) ;
	}
	
	return assigned ;
}


MergerPannel.Layout.prototype.filterChildren = function(children)
{
	var $ = jquery ;
	for(var i=children.length-1;i>=0;i--)
	{
		// 排除空的 frame
		if( $(children[i]).hasClass('jc-frame') && $(children[i]).children('.jc-layout').size()==0 )
		{
			this.log('empty frame: '+children[i].id) ;
			$(children[i]).width(0) ;
			$(children[i]).height(0) ;
			children.splice(i,1) ;
		}
	}
}

MergerPannel.Layout.prototype.getMapMVCMergerItemProperties = function(id,propertyName){
	if(typeof mapMVCMergerItemProperties == 'undefined'){
		mapMVCMergerItemProperties = {};
	}
	if(typeof mapMVCMergerItemProperties[id] == 'undefined'){
		mapMVCMergerItemProperties[id] = {};
	}
	if(typeof mapMVCMergerItemProperties[id][propertyName] == 'undefined'){
		mapMVCMergerItemProperties[id][propertyName] = '';
	}
	return mapMVCMergerItemProperties[id][propertyName];
}