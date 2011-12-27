var mvcmerger = {} ;
mvcmerger.draggingView = null ;
mvcmerger.droppingToView = null ;
mvcmerger.stopDragging = function() {
	mvcmerger.draggingView.stopDragging() ;
	mvcmerger.draggingView = null ;
	mvcmerger.droppingToView = null ;
}

// 视图类 ------------------------
mvcmerger.View = function(element)
{
	jquery(element).data('view',this) ;
	this.element = element ;
	
	this.bindEvents();
}
mvcmerger.View.obj = function(element)
{
	return jquery(element).data('view') ;
}
mvcmerger.View.prototype.bindEvents = function()
{
	// 视图的鼠标效果
	jquery(this.element).mouseover(function(e){
		// 先把所有其它的视图 mouseover 效果移除
		jquery(".mvc_merger-layout_settable_view_mouseover").removeClass('mvc_merger-layout_settable_view_mouseover') ;
		// 加上mouseover
		jquery(this).addClass('mvc_merger-layout_settable_view_mouseover') ;
		e.stopPropagation() ;
	}) ;
	jquery(this.element).mouseleave(function(e){
		jquery(this).removeClass('mvc_merger-layout_settable_view_mouseover') ;
	}) ;
	
	// 拖放效果
	jquery(this.element).draggable({
		zIndex: 1000
		// , cursor: 'crosshair'
		, cursorAt: { left:10, top:10 }
		, distance: 10 // 拖动生效所需的 鼠标移动距离
		, start: function(event,ui) {

			if( jquery(this).hasClass('mvcmerger-viewlayout') )
			{
				jquery('#mvc_merger-layout-dropping-buttons-box').hide() ;
				
				// 已经有一个正在拖拽的视图
				if( mvcmerger.draggingView )
				{
					// 如果正在拖拽的视图不是自己，禁止拖拽
					// 否则允许继续拖拽，但是不重复记录拖拽前的状态
					var bRet = mvcmerger.draggingView==mvcmerger.View.obj(this) ;
					return bRet ;
				}
				
				// 记录拖拽前的状态
				mvcmerger.View.obj(this).startDragging() ;
			}
		}
		, drag: function(event,ui) {
			jquery(this) ;
		}
	}) ;
	jquery(this.element).droppable({
		tolerance: 'pointer'
		//, hoverClass: 'mvc_merger-layout_settable_view_mouseover'
		, over: function(event,ui) {
			if( jquery(ui.draggable).hasClass('mvcmerger-viewlayout') )
			{
				// 先把所有其它的视图 mouseover 效果移除
				jquery(".mvc_merger-layout_settable_view_mouseover").removeClass('mvc_merger-layout_settable_view_mouseover') ;
				jquery(this).addClass('mvc_merger-layout_settable_view_mouseover') ;
				
//				console.log('dropping:over '+this.id) ;
			}
		}
		, out: function(event,ui) {
			if( jquery(ui.draggable).hasClass('mvcmerger-viewlayout') )
			{
				// 移除 mouseover 效果
				jquery(this).removeClass('mvc_merger-layout_settable_view_mouseover') ;
				
//				console.log('dropping:out '+this.id) ;
			}
		}
		, drop: function(event,ui) {

			if( jquery(ui.draggable).hasClass('mvcmerger-viewlayout') )
			{
				// 对保留 mouseover 效果的元素进行操作
				mvcmerger.droppingToView = jquery('.mvc_merger-layout_settable_view_mouseover').data('view') ;
				
//				console.log('drop '+mvcmerger.droppingToView.element.id) ;
				jquery('#mvc_merger-layout-dropping-buttons-box').css('left',event.originalEvent.pageX) ;
				jquery('#mvc_merger-layout-dropping-buttons-box').css('top',event.originalEvent.pageY) ;
				jquery('#mvc_merger-layout-dropping-buttons-box').show() ;
			}
		}
	});
}
mvcmerger.View.prototype.startDragging = function()
{
	jquery(this.element).data('drag-origin-position',jquery(this.element).css('position')) ;
	jquery(this.element).data('drag-origin-top',jquery(this.element).css('top')) ;
	jquery(this.element).data('drag-origin-left',jquery(this.element).css('left')) ;
	jquery(this.element).addClass('mvc_merger-layout_settable_view_dragging') ;

	// jquery(this.element).css('position','absolute') ;
	
	mvcmerger.draggingView = this ;
}
mvcmerger.View.prototype.stopDragging = function()
{
	jquery(this.element).css('position',jquery(this.element).data('drag-origin-position')) ;
	jquery(this.element).css('top',jquery(this.element).data('drag-origin-top')) ;
	jquery(this.element).css('left',jquery(this.element).data('drag-origin-left')) ;
	jquery(this.element).css('z-index',jquery(this.element).data('drag-origin-zindex')) ;

	jquery(this.element).removeClass('mvc_merger-layout_settable_view_dragging') ;
	
	jquery('#mvc_merger-layout-dropping-buttons-box').hide() ;
}
mvcmerger.View.prototype.put = function(view,where)
{
	if(where=='before')
	{
		jquery(this.element).before(view.element) ;		
	}
	else 
	{
		jquery(this.element).after(view.element) ;
	}
	
	// float
	view.autoFloat();
		
	this.bindEvents() ;
}
mvcmerger.View.prototype.autoFloat = function()
{
	jquery(this.element).css('float',(mvcmerger.LayoutFrame.isH(this.element.parentNode)?'left':'none')) ;
}
mvcmerger.View.prototype.belongsFrame = function()
{
	// 检查是否在一个frame item中
	if( typeof(this.element.parentNode)=='undefined' || !jquery(this.element.parentNode).hasClass('jc-view-layout-frame_item') )
	{
		return null ;
	}
	if( typeof(this.element.parentNode.parentNode)=='undefined' || !jquery(this.element.parentNode.parentNode).hasClass('jc-view-layout-frame') )
	{
		throw new Error("对象在 frame item 中，但是这个 item 却不在frame 中， 系统的 frame/item/view 结构遭到损坏") ;
	}
	return mvcmerger.View.obj(this.element.parentNode.parentNode) ;
}



//视图布局框架类 ------------------------
mvcmerger.LayoutFrame = function(element)
{
	// 继承自 view
	mvcmerger.View.apply(this,[element]) ;
}
mvcmerger.LayoutFrame.prototype = new mvcmerger.View() ;
mvcmerger.LayoutFrame.create = function(type)
{
	var newFrame = document.createElement('div') ;
	jquery(newFrame).addClass('jc-view-layout-frame') ;
	jquery(newFrame).addClass(mvcmerger.LayoutFrame.types[type]) ;
	jquery(newFrame).addClass('mvcmerger-viewlayout') ;
	jquery(newFrame).addClass('mvcmerger-tmp-frame') ;
	jquery(newFrame).html('<div class="jc-view-layout-end-item" />') ;
	
	return new mvcmerger.LayoutFrame(newFrame) ;
}
mvcmerger.LayoutFrame.prototype.putin = function(view)
{
	jquery(this.element).find('>.jc-view-layout-end-item').before(view.element) ;
	view.autoFloat();
}
mvcmerger.LayoutFrame.types = {
		h: 'jc-view-layout-frame-horizontal'
		, v: 'jc-view-layout-frame-vertical'
		, tab: 'jc-view-layout-frame-tab'
}
mvcmerger.LayoutFrame.prototype.layoutType = function(){
	
	for(var type in mvcmerger.LayoutFrame.types)
	{
		if( jquery(this.element).hasClass( mvcmerger.LayoutFrame.types[type] ) )
		{
			return type ;
		}
	}
	
	return 'v' ;
}
mvcmerger.LayoutFrame.prototype.isH = function()
{
	return mvcmerger.LayoutFrame.isH(this.element) ;
}
mvcmerger.LayoutFrame.isH = function(layoutElement)
{
	return jquery(layoutElement).hasClass(mvcmerger.LayoutFrame.types.h) ;
}

mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame = function()
{
	jquery(".jc-view-layout-frame").each(function(){
		
		// 模板中提供的 frame， 非 js 临时创建
		if(!jquery(this).hasClass('mvcmerger-tmp-frame'))
		{
			return ;
		}
		
		if( jquery(this).find('>.mvcmerger-viewlayout').size() <=1 )
		{
			// 见内部的子元素提上来
			jquery(this).find('>.mvcmerger-viewlayout').each(function(){
				jquery(this.parentNode).after(this) ;
				mvcmerger.View.obj(this).autoFloat();
			}) ;
			
			// 删除layout
			jquery(this).removeData('view') ;
			this.parentNode.removeChild(this) ;
		}
	}) ;
}


// ------------------
mvcmerger.exportedItems = {} ;
mvcmerger.exportConfig = function()
{
	mvcmerger.exportedItems = {} ;
	var config = [] ;
	
	jquery('.jc-view-layout-frame').each(function(){

		// 过滤非顶层 frame
		if( !this.parentNode || !jquery(this).hasClass('mvcmerger-viewlayout') || jquery(this.parentNode).hasClass('mvcmerger-tmp-frame') )
		{
			return ;
		}

		if( this.id && typeof(mvcmerger.exportedItems[this.id])!='undefined' )
		{
			return ;
		}
//		console.log(this.id+', name:'+jquery(this).attr('name')) ;

		var frameConfig = mvcmerger.exportLayoutConfig(mvcmerger.View.obj(this)) ;
		if(frameConfig)
		{
			if(this.id)
			{
				mvcmerger.exportedItems[this.id] = this ;
			}
			
			config.push( frameConfig ) ;
		}
	}) ;
	
	return config ;
}
mvcmerger.exportLayoutConfig = function(layout)
{
	
	var config = { 
			class: 'frame'
			, type: layout.layoutType()
			, xpath: jquery(layout.element).data('xpath')
			, name: jquery(layout.element).attr('name')
			, items : []
			, properties: jquery(layout.element).data("properties")
			, attributes : jquery(layout.element).data("attributes")
	} ;
	
	jquery(layout.element).find('>.mvcmerger-viewlayout').each(function(){

		if( this.id && typeof(mvcmerger.exportedItems[this.id])!='undefined' )
		{
			return ;
		}
		
		var obj = mvcmerger.View.obj(this) ;
		
		// 递归下级 layout
		if( obj instanceof mvcmerger.LayoutFrame )
		{
			var frameConfig = mvcmerger.exportLayoutConfig(obj) ;
			if(frameConfig)
			{
				if(this.id)
				{
					mvcmerger.exportedItems[this.id] = this ;
				}
				config.items.push( frameConfig ) ;
			}
		}
		
		else
		{
			if(jquery(this).data('xpath'))
			{
				if(this.id)
				{
					mvcmerger.exportedItems[this.id] = this ;
				}
				config.items.push({
					class: 'view'
					, id: this.id
					//, name: jquery(this).attr('name') 
					, xpath: jquery(this).data('xpath')
					, properties: jquery(this).data("properties")
					, attributes: jquery(this).data("attributes")
				}) ;
			}
		}
	}) ;
	
	return config.items.length? config: null ;
};

JSON.stringify = JSON.stringify || function (obj) {
    var t = typeof (obj);
    if (t != "object" || obj === null) {
        // simple data type
        if (t == "string") obj = '"'+obj+'"';
        return String(obj);
    }
    else {
        // recurse array or object
        var n, v, json = [], arr = (obj && obj.constructor == Array);
        for (n in obj) {
            v = obj[n]; t = typeof(v);
            if (t == "string") v = '"'+v+'"';
            else if (t == "object" && v !== null) v = JSON.stringify(v);
            json.push((arr ? "" : '"' + n + '":') + String(v));
        }
        return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
    }
};
/* -----------------风格菜单------------------ */
mvcmerger.styleoption = {
	optionDialog:jQuery('<div class="styleoption" title="视图属性">'
			+ '<ul>'
				+ '<li><label title="class">css类<input type="text" class="styleoption_class" value=""/></label></li>'
				+ '<li><label title="width">宽度<input type="text" class="styleoption_width" value=""/></label></li>'
				+ '<li><label title="height">高度<input type="text" class="styleoption_height" value=""/></label></li>'
				+ '<li><label title="margin">外边距<input type="text" class="styleoption_margin_u" title="外边距:上"/></label>'
					+ '<input type="text" class="styleoption_margin_r" title="外边距:右"/>'
					+ '<input type="text" class="styleoption_margin_b" title="外边距:下"/>'
					+ '<input type="text" class="styleoption_margin_l" title="外边距:左"/>'
				+ '</li>'
				+ '<li><label title="padding">内边距<input type="text" class="styleoption_padding_u" title="内边距:上"/></label>'
					+ '<input type="text" class="styleoption_padding_r" title="内边距:右"/>'
					+ '<input type="text" class="styleoption_padding_b" title="内边距:下"/>'
					+ '<input type="text" class="styleoption_padding_l" title="内边距:左"/>'
				+ '</li>'
				+ '<li><label title="border">边框</label><br/>'
					+ '<label title="border-top">上<select class="styleoption_border_type_top">'
						+ '<option value="none">none</option>'
						+ '<option value="solid">solid</option>'
						+ '<option value="inset">inset</option>'
						+ '<option value="outset">outset</option>'
						+ '<option value="hidden">hidden</option>'
						+ '<option value="dotted">dotted</option>'
						+ '<option value="dashed">dashed</option>'
						+ '<option value="double">double</option>'
						+ '<option value="groove">groove</option>'
						+ '<option value="ridge">ridge</option>'
						+ '<option value="inherit">inherit</option>'
					+ '</select></label>'
					+ '<input type="text" class="styleoption_border_top" title="宽度:上"/>'
					+ '<input type="text" class="styleoption_border_color_top" title="颜色:上"/><br/>'
					
					+ '<label title="border-bottom">下<select class="styleoption_border_type_bottom">'
						+ '<option value="none">none</option>'
						+ '<option value="solid">solid</option>'
						+ '<option value="inset">inset</option>'
						+ '<option value="outset">outset</option>'
						+ '<option value="hidden">hidden</option>'
						+ '<option value="dotted">dotted</option>'
						+ '<option value="dashed">dashed</option>'
						+ '<option value="double">double</option>'
						+ '<option value="groove">groove</option>'
						+ '<option value="ridge">ridge</option>'
						+ '<option value="inherit">inherit</option>'
					+ '</select></label>'
					+ '<input type="text" class="styleoption_border_bottom" title="宽度:下"/>'
					+ '<input type="text" class="styleoption_border_color_bottom" title="颜色:下"/><br/>'
					
					+ '<label title="border-left">左<select class="styleoption_border_type_left">'
						+ '<option value="none">none</option>'
						+ '<option value="solid">solid</option>'
						+ '<option value="inset">inset</option>'
						+ '<option value="outset">outset</option>'
						+ '<option value="hidden">hidden</option>'
						+ '<option value="dotted">dotted</option>'
						+ '<option value="dashed">dashed</option>'
						+ '<option value="double">double</option>'
						+ '<option value="groove">groove</option>'
						+ '<option value="ridge">ridge</option>'
						+ '<option value="inherit">inherit</option>'
					+ '</select></label>'
					+ '<input type="text" class="styleoption_border_left" title="宽度:左"/>'
					+ '<input type="text" class="styleoption_border_color_left" title="颜色:左"/><br/>'
					
					+ '<label title="border-right">右<select class="styleoption_border_type_right">'
						+ '<option value="none">none</option>'
						+ '<option value="solid">solid</option>'
						+ '<option value="inset">inset</option>'
						+ '<option value="outset">outset</option>'
						+ '<option value="hidden">hidden</option>'
						+ '<option value="dotted">dotted</option>'
						+ '<option value="dashed">dashed</option>'
						+ '<option value="double">double</option>'
						+ '<option value="groove">groove</option>'
						+ '<option value="ridge">ridge</option>'
						+ '<option value="inherit">inherit</option>'
					+ '</select></label>'
					+ '<input type="text" class="styleoption_border_right" title="宽度:右"/>'
					+ '<input type="text" class="styleoption_border_color_right" title="颜色:右"/><br/>'
				+ '</li>'
				+ '<li><label title="background">背景</label><br/>'
				+ '<label title="background-img">背景图路径<input class="styleoption_background_img"/></label><br/>'
				+ '<label title="background-color">背景颜色<input class="styleoption_background_color"/></label><br/>'
				+ '<label title="background-position">偏移<input class="styleoption_background_position"/></label><br/>'
				+ '<label title="background-repeat">重复<select class="styleoption_repeat">'
					+ '<option value="repeat">repeat</option>'
					+ '<option value="no-repeat">no-repeat</option>'
					+ '<option value="repeat-x">repeat-x</option>'
					+ '<option value="repeat-y">repeat-y</option>'
					+ '<option value="inherit">inherit</option>'
				+ '</select></label></li>'
				+ '<li><label title="style">样式<textarea class="styleoption_style"/></label></li>'
				+ '<li><label title="title">标题<input type="text" class="styleoption_title"/></label></li>'
				+ '<li><label title="layout-type">布局类型'
					+ '<select class="styleoption_type">'
						+ '<option value="v">竖向</option>'
						+ '<option value="h">横向</option>'
						+ '<option value="tab">选项卡</option>'
					+ '</select>'
					+ '</label>'
				+ '</li>'
			+ '</ul>'
			+ '</div>'),
	openedOptionDialog:null,
};
//给view添加打开styleoption的按钮
mvcmerger.styleoption.optionbtn = function(view){
	view.hover(function(e){
		var openbtns =jQuery("<div class='optionBtnsContainer'></div>");
		view.append(openbtns);
		mvcmerger.styleoption.buildParentOptionbtns(view,openbtns);
//		e.stopPropagation() ;
	},function(e){
		view.find(".optionBtnsContainer").remove();
//		e.stopPropagation() ;
	});
};

mvcmerger.styleoption.buildParentOptionbtns = function(view,btnContainer){
	var openbtn =jQuery("<div class='styleoption_open_btn'></div>");
	btnContainer.append(openbtn.data("frame",view).attr('title',view.get(0).id));
	//设置btntype,btntype指的是btn对应frame的类型,这个class用来显示不同的按钮样式
	if(view.hasClass("jc-view-layout-item")){
		openbtn.addClass("jc-view-btn-item");
	}else if(view.hasClass("jc-view-layout-frame-horizontal")){
		openbtn.addClass("jc-view-btn-horizontal");
	}else if(view.hasClass("jc-view-layout-frame-vertical")){
		openbtn.addClass("jc-view-btn-vertical");
	}else if(view.hasClass("jc-view-layout-frame-tab")){
		openbtn.addClass("jc-view-btn-tab");
	}
	openbtn.click(function(){
		mvcmerger.styleoption.open(jQuery(this));
	});
	openbtn.hover(function(){
		jQuery(this).data("frame").addClass("highLightFrame");
	},function(){
		jQuery(this).data("frame").removeClass("highLightFrame");
	});
	var parentFrame = view.parents('.jc-view-layout-frame:first');
	if(parentFrame.length == 0){
		return;
	}else{
		mvcmerger.styleoption.buildParentOptionbtns(parentFrame,btnContainer);
	}
};

//打开菜单的方法
mvcmerger.styleoption.open = function(openbtn){
	var view = openbtn.data("frame");
	//表单唯一
	if(jQuery.type(mvcmerger.styleoption.openedOptionDialog) == 'object'){
		mvcmerger.styleoption.openedOptionDialog.remove();
	}
	
	mvcmerger.styleoption.openedOptionDialog = mvcmerger.styleoption.optionDialog.clone();
	
	//是横向layout还是纵向,还是tab?也可能哪个也不是:all false
	var isH = view.hasClass('jc-view-layout-frame-horizontal') ? true : null;
	var isV = view.hasClass('jc-view-layout-frame-vertical') ? true : null;
	var isT = view.hasClass('jc-view-layout-frame-tab') ? true : null;
	
	//只有layout才有type属性
	if(!isH  && !isV && !isT){
		mvcmerger.styleoption.openedOptionDialog.find('.styleoption_type').closest('li').remove();
	}
	
	view.append(mvcmerger.styleoption.openedOptionDialog);
	
	//保存事件
	mvcmerger.styleoption.save = function(){
		var style  = {};
//		if(jQuery.type(view.data("properties")) != "object"){
//			view.data("properties",{});
//		}else{
//			style = view.data("properties");
//		}
		var inputAndSelect = mvcmerger.styleoption.openedOptionDialog.find("select,input,textarea");
		inputAndSelect.each(function(index){
			if(jQuery(this).hasClass("styleoption_border_type_top")
					|| jQuery(this).hasClass("styleoption_border_type_right")
					|| jQuery(this).hasClass("styleoption_border_type_bottom")
					|| jQuery(this).hasClass("styleoption_border_type_left")){
				if(jQuery(this).val() != "none"){
					style[jQuery(this).attr("class")] = jQuery(this).val();
				}
			}else if(jQuery(this).hasClass("styleoption_repeat")){
				if(jQuery(this).val() != "repeat"){
					style[jQuery(this).attr("class")] = jQuery.trim(jQuery(this).val());
				}
			}else if(jQuery.trim(jQuery(this).val()) != ""){
				style[jQuery(this).attr("class")] = jQuery.trim(jQuery(this).val());
			}
		});
		
		view.data( "properties" , style);
		//根据表单中的内容重新计算参数
		view.data( "attributes" , mvcmerger.styleoption.getAttributes(view));
		view.attr( "style" , view.data( "attributes" )['style']);
	};
	mvcmerger.styleoption.openedOptionDialog.find("select,input,textarea").change(mvcmerger.styleoption.save);

	//关闭菜单的方法
	mvcmerger.styleoption.cancel = function(){
		mvcmerger.styleoption.openedOptionDialog.remove();
		delete mvcmerger.styleoption.openedOptionDialog;
	};
	//还原菜单的方法
	mvcmerger.styleoption.reset = function(){
		if(!confirm("确定要还原到最初的数据吗?刚刚编辑的数据将丢失?")){
			return;
		}
		view.data( "properties" , view.data("origin_properties"));
		//根据表单中的内容重新计算参数
		view.data( "attributes" , mvcmerger.styleoption.getAttributes(view));
		//还原表单
		mvcmerger.styleoption.restoreForm(view);
		view.attr( "style" , view.data( "attributes" )['style']);
	};
	
	mvcmerger.styleoption.openedOptionDialog.dialog({
		buttons:{
			'还原':mvcmerger.styleoption.reset,
			'关闭':mvcmerger.styleoption.cancel
		}
		, width:400
		, height:600
		, closeText: 'hide'
		, closeOnEscape: true
		, show: 'slide'
	});
	
	//体现layout 的type类型到.styleoption_type中
	if(isH && !view.data('type')){
		view.data("type","h");
	}else if(isV && !view.data('type')){
		view.data("type","v");
	}else if(isT && !view.data('type')){
		view.data("type","tab");
	}
	
	mvcmerger.styleoption.restoreForm(view);
	
};
mvcmerger.styleoption.restoreForm = function(view){
	//取得view的数据(还原表单)
	var inputAndSelect = mvcmerger.styleoption.openedOptionDialog.find("select,input,textarea");
	if(view.data("layout-properties")){
		view.data("properties",view.data("layout-properties")['properties']);
		//备份原始数据,提供还原功能
		view.data("origin_properties",view.data("layout-properties")['properties']);
		//经过数据还原的表单不再依赖原始数据,为了节省内存而清理
		view.removeData("layout-properties");
	}else{
		view.data("origin_properties",{});
	}
	var styleForFrame = view.data("properties");
	if(styleForFrame){
		inputAndSelect.each(function(index){
			jQuery(this).val(styleForFrame[jQuery(this).attr("class")]);
		});
	}
};
mvcmerger.styleoption.getAttributes = function(frame){
	var styleData = frame.data("properties");
	if(jQuery.type(styleData) == "undefined"){
		return {};
	}
	var styleListForSave = ['class','width','height','margin','padding','border','background','title','type'];
	var attributes = {style:""};
	jQuery.each(styleListForSave,function(i,v){
		if(v == "margin"){
			var arrMargin = [];
			if(styleData['styleoption_margin_u']){
				arrMargin.push(styleData['styleoption_margin_u']);
			}
			if(styleData['styleoption_margin_r']){
				arrMargin.push(styleData['styleoption_margin_r']);
			}
			if(styleData['styleoption_margin_b']){
				arrMargin.push(styleData['styleoption_margin_b']);
			}
			if(styleData['styleoption_margin_l']){
				arrMargin.push(styleData['styleoption_margin_l']);
			}
			if(jQuery.trim(arrMargin.join(" ")) != ""){
				attributes['style'] += v+":"+jQuery.trim(arrMargin.join(" "))+";";
			}
		}else if(v == 'padding'){
			var arrPadding = [];
			if(styleData['styleoption_padding_u']){
				arrPadding.push(styleData['styleoption_padding_u']);
			}
			if(styleData['styleoption_padding_r']){
				arrPadding.push(styleData['styleoption_padding_r']);
			}
			if(styleData['styleoption_padding_b']){
				arrPadding.push(styleData['styleoption_padding_b']);
			}
			if(styleData['styleoption_padding_l']){
				arrPadding.push(styleData['styleoption_padding_l']);
			}
			if(jQuery.trim(arrPadding.join(" ")) != ""){
				attributes['style'] += v+":"+jQuery.trim(arrPadding.join(" "))+";";
			}
		}else if(v == 'border'){
			var typeClassName = 'styleoption_border_type_';
			var widthClassName = 'styleoption_border_';
			var colorClassName = 'styleoption_border_color_';
			var arrParts = ['top','right','bottom','left'];
			jQuery.each(arrParts,function(ii,vv){
				var onePartOfBorder = "";
				if(styleData[typeClassName + vv]){
					onePartOfBorder += styleData[typeClassName + vv] ? styleData[typeClassName + vv] + ' ' : '';
				}
				if(jQuery.trim(styleData[widthClassName + vv]) && jQuery.trim(styleData[widthClassName + vv]) != ""){
					onePartOfBorder += styleData[widthClassName + vv] ? styleData[widthClassName + vv] + ' ' : ' ';
				}
				onePartOfBorder += styleData[colorClassName + vv] ? styleData[colorClassName + vv] : '';
				if(jQuery.trim(onePartOfBorder) != "" && jQuery.trim(onePartOfBorder) != "none"){
					attributes['style'] += "border-"+vv+":"+jQuery.trim(onePartOfBorder)+";";
				}
			});
		}else if(v == 'background'){
			var backgroundCode = styleData['styleoption_background_img'] ? styleData['styleoption_background_img']+' ' : '';
			backgroundCode += styleData['styleoption_background_color'] ? styleData['styleoption_background_color'] + ' ' : ' ';
			backgroundCode += styleData['styleoption_background_position'] ? styleData['styleoption_background_position'] + ' ': ' ';
			backgroundCode += (styleData['styleoption_repeat'] && styleData['styleoption_repeat'] != 'repeat') ? styleData['styleoption_repeat'] : '';
			var background = jQuery.trim(backgroundCode);
			if(background && background != ""){
				attributes['style'] += v+":"+background+";";
			}
		}else if(v == 'width'  || v == 'height'){
			if(jQuery.trim(styleData['styleoption_'+ v]) != ''){
				attributes['style'] += v+":"+jQuery.trim(styleData['styleoption_'+ v])+";";
			}
		}else{
			if(jQuery.trim(styleData['styleoption_'+ v]) != ''){
				attributes[v] = jQuery.trim(styleData['styleoption_'+ v]);
			}
		}
	});
	if(styleData['styleoption_style']){
		attributes['style'] += styleData['styleoption_style'];
	}
	return attributes;
};
/* ----------------------------------- */

jquery(function(){
	// 初始化 view 
	jquery(".mvcmerger-viewlayout").each(function(idx,view){
		if( jquery(this).hasClass('jc-view-layout-frame') )
		{
			new mvcmerger.LayoutFrame(view) ;
		}
		else if( jquery(this).hasClass('jc-view-layout-item') )
		{
			var aMvcmergerView = new mvcmerger.View(view) ;
		}
		//添加styleoption的打开按钮
		mvcmerger.styleoption.optionbtn(jQuery(view));
	}) ;
	
	// 操作界面
	jquery(document.body).append(
			"<div id='mvc_merger-view_layout_setting_controlPanel' title='视图布局'>" +
				"<span id='mvc_merger-view_layout_setting_controlPanel_messages'></span><br/>" +
				"<label><input name='save_type' type='radio' value='type' checked/>所有类型网页</label><br/>" +
				"<label><input name='save_type' type='radio' value='current'/>仅当前网页</label><br/>" +
				"<label><input name='save_type' type='radio' value='special'/>指定条件</label>" +
				"<input id='save_special_params' type='text' value=''/><br/>" +
			"</div>"
			) ;
	
	jQuery('#save_special_params').val(getUrlPamars());  //?c=index&mvcmerger_layout_setting=1
	function getUrlPamars(){
		var arrSearch = window.location.search.split('?');
		if(!jQuery.isArray(arrSearch)){
			return '';
		}
		var arrUrlParams = arrSearch[1].split('&');
		var arrUrlParamsResult= [];
		for(var i = 0 ; i < arrUrlParams.length ; i++){
			var arrOneParam = arrUrlParams[i].split('=');
			if(arrOneParam[0] == 'c' || arrOneParam[0] == 'mvcmerger_layout_setting'){
				continue;
			}
			arrUrlParamsResult.push(arrUrlParams[i]);
		}
		return arrUrlParamsResult.join('&');
	}
	
	jquery('#mvc_merger-view_layout_setting_controlPanel').dialog({
		buttons:{
			'清理设置':function(){
				jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('正在清理视图布局的配置 ... ...') ;
				
				jquery.ajax( '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&only_msg_queue=1&act=clear&controller='+currentControllerClass,{
					complete: function(jqXHR, textStatus){
						if(textStatus=='success')
						{
							jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html(jqXHR.responseText) ;
						}
						else
						{
							jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('保存操作遇到网络错误。') ;
						}
					}
				} ) ; 
			}
			, '保存':function(){
				var config = mvcmerger.exportConfig() ;
				if( !config || !config.length )
				{
					jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('配置无效') ;
					return ;
				}
				
				jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('正在保存视图布局的配置 ... ...') ;
				
				var saveType = jQuery('input:checked').val();
				var specialParams = '';
				if(saveType == 'special'){
					specialParams = jQuery('#save_special_params').val();
				}
				jquery.ajax( '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&only_msg_queue=1&act=save',{
					data:{
						controller: currentControllerClass
						, config: JSON.stringify(config)
						, saveType: saveType
						, params: specialParams ? specialParams : getUrlPamars()
					}
					, type: 'POST'
					, complete: function(jqXHR, textStatus){
						if(textStatus=='success')
						{
							jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html(jqXHR.responseText) ;
						}
						else
						{
							jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('保存操作遇到网络错误。') ;
						}
					}
				} ) ; 
			}
		}
		, closeText: 'hide'
		, closeOnEscape: false
		, show: 'slide'
	});
	
	// "放置"工具按钮
	jquery(document.body).append('<div id="mvc_merger-layout-dropping-buttons-box">'
			+ '<div id="mvc_merger-layout-dropping-before" class="mvc_merger-layout-dropping-button">前</div>'
			+ '<div id="mvc_merger-layout-dropping-after" class="mvc_merger-layout-dropping-button">后</div>'
			+ '<div id="mvc_merger-layout-dropping-h-before" class="mvc_merger-layout-dropping-button">横向左</div>'
			+ '<div id="mvc_merger-layout-dropping-h-after" class="mvc_merger-layout-dropping-button">横向右</div>'
			+ '<div id="mvc_merger-layout-dropping-v-before" class="mvc_merger-layout-dropping-button">竖向上</div>'
			+ '<div id="mvc_merger-layout-dropping-v-after" class="mvc_merger-layout-dropping-button">竖向下</div>'
			+ '<div id="mvc_merger-layout-dropping-cannel" class="mvc_merger-layout-dropping-button">取消</div>'
			+ '</div>'
	) ;
	
	// 取消按钮
	jquery("#mvc_merger-layout-dropping-cannel").click(function(){
		mvcmerger.stopDragging() ;
	}) ;
	
	// 插入当前位置按钮
	jquery("#mvc_merger-layout-dropping-before").click(function(){
		mvcmerger.droppingToView.put(mvcmerger.draggingView,'before') ;
		mvcmerger.stopDragging() ;
		
		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;
	jquery("#mvc_merger-layout-dropping-after").click(function(){
		mvcmerger.droppingToView.put(mvcmerger.draggingView,'after') ;
		mvcmerger.stopDragging() ;
		
		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;

	// 建立 横向 布局框架并插入
	jquery("#mvc_merger-layout-dropping-h-before").click(function(){
		var newFrame = mvcmerger.LayoutFrame.create('h') ;
		mvcmerger.droppingToView.put(newFrame,'after') ;

		newFrame.putin(mvcmerger.draggingView) ;
		newFrame.putin(mvcmerger.droppingToView) ; 
		
		mvcmerger.stopDragging() ;
		
		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;
	jquery("#mvc_merger-layout-dropping-h-after").click(function(){
		var newFrame = mvcmerger.LayoutFrame.create('h') ;
		mvcmerger.droppingToView.put(newFrame,'after') ;

		newFrame.putin(mvcmerger.droppingToView) ; 
		newFrame.putin(mvcmerger.draggingView) ;
		
		mvcmerger.stopDragging() ;
		
		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;
	// 建立 纵向 布局框架并插入
	jquery("#mvc_merger-layout-dropping-v-before").click(function(){
		var newFrame = mvcmerger.LayoutFrame.create('v') ;
		mvcmerger.droppingToView.put(newFrame,'after') ;

		newFrame.putin(mvcmerger.draggingView) ;
		newFrame.putin(mvcmerger.droppingToView) ; 
		
		mvcmerger.stopDragging() ;
		
		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;
	jquery("#mvc_merger-layout-dropping-v-after").click(function(){
		var newFrame = mvcmerger.LayoutFrame.create('v') ;
		mvcmerger.droppingToView.put(newFrame,'after') ;

		newFrame.putin(mvcmerger.droppingToView) ; 
		newFrame.putin(mvcmerger.draggingView) ;
		
		mvcmerger.stopDragging() ;

		// 清理多余的 layout frame
		mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame() ;
	}) ;
	
	
}) ;