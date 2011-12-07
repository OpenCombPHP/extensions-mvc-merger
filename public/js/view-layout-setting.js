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
//		console.log('mouseover '+this.id) ;
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

			if( jquery(this).hasClass('org_jecat_framework_view') )
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
			if( jquery(ui.draggable).hasClass('org_jecat_framework_view') )
			{
				// 先把所有其它的视图 mouseover 效果移除
				jquery(".mvc_merger-layout_settable_view_mouseover").removeClass('mvc_merger-layout_settable_view_mouseover') ;
				jquery(this).addClass('mvc_merger-layout_settable_view_mouseover') ;
				
//				console.log('dropping:over '+this.id) ;
			}
		}
		, out: function(event,ui) {
			if( jquery(ui.draggable).hasClass('org_jecat_framework_view') )
			{
				// 移除 mouseover 效果
				jquery(this).removeClass('mvc_merger-layout_settable_view_mouseover') ;
				
//				console.log('dropping:out '+this.id) ;
			}
		}
		, drop: function(event,ui) {

			if( jquery(ui.draggable).hasClass('org_jecat_framework_view') )
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
	// jquery(this.element).css('float',(mvcmerger.LayoutFrame.isH(this.element.parentNode)?'left':'none')) ;
}
mvcmerger.View.prototype.belongsFrame = function()
{
	// 检查是否在一个frame item中
	if( typeof(this.element.parentNode)=='undefined' || !jquery(this.element.parentNode).hasClass('org_jecat_framework_view-layout-frame_item') )
	{
		return null ;
	}
	if( typeof(this.element.parentNode.parentNode)=='undefined' || !jquery(this.element.parentNode.parentNode).hasClass('org_jecat_framework_view-layout-frame') )
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
	jquery(newFrame).addClass('org_jecat_framework_view-layout-frame') ;
	jquery(newFrame).addClass(mvcmerger.LayoutFrame.types[type]) ;
	jquery(newFrame).addClass('org_jecat_framework_view') ;
	jquery(newFrame).addClass('tmp-frame') ;
	jquery(newFrame).html('<div class="org_jecat_framework_view-layout-end" />') ;
	
	return new mvcmerger.LayoutFrame(newFrame) ;
}
mvcmerger.LayoutFrame.prototype.putin = function(view)
{
	jquery(this.element).find('>.org_jecat_framework_view-layout-end').before(view.element) ;
	view.autoFloat();
}
mvcmerger.LayoutFrame.types = {
		h: 'org_jecat_framework_view-layout-frame-horizontal'
		, v: 'org_jecat_framework_view-layout-frame-vertical'
		, tab: 'org_jecat_framework_view-layout-frame-tab'
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
	jquery(".org_jecat_framework_view-layout-frame").each(function(){
		
		// 模板中提供的 frame， 非 js 临时创建
		if(!jquery(this).hasClass('tmp-frame'))
		{
			return ;
		}
		
		if( jquery(this).find('>.org_jecat_framework_view').size() <=1 )
		{
			// 见内部的子元素提上来
			jquery(this).find('>.org_jecat_framework_view').each(function(){
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
mvcmerger.exportConfig = function()
{
	var config = [] ;
	
	jquery('.org_jecat_framework_view-layout-frame').each(function(){
		// 过滤非顶层 frame
		if( !this.parentNode || jquery(this.parentNode).hasClass('org_jecat_framework_view-layout-frame') )
		{
			return ;
		}

		var frameConfig = mvcmerger.exportLayoutConfig(mvcmerger.View.obj(this)) ;
		if(frameConfig)
		{
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
			, items:[]
	} ;
	
	if(!jquery(layout.element).hasClass('tmp-frame'))
	{
		config.name = jquery(layout.element).attr('name') ;
	}
	
	jquery(layout.element).find('>.org_jecat_framework_view').each(function(){
		var obj = mvcmerger.View.obj(this) ;
		
		// 递归下级 layout
		if( obj instanceof mvcmerger.LayoutFrame )
		{
			var frameConfig = mvcmerger.exportLayoutConfig(obj) ;
			if(frameConfig)
			{
				config.items.push( frameConfig ) ;
			}
		}
		
		else
		{
			if(jquery(this).data('xpath'))
			{
				config.items.push({
					class: 'view'
					, id: this.id
					//, name: jquery(this).attr('name') 
					, xpath: jquery(this).data('xpath')
				}) ;
			}
		}
	}) ;
	
	return config.items.length? config: null ;
}
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
				+ '<li><label>class<input type="text" class="styleoption_class" value=""/></label></li>'
				+ '<li><label>width<input type="text" class="styleoption_width" value=""/></label></li>'
				+ '<li><label>height<input type="text" class="styleoption_height" value=""/></label></li>'
				+ '<li><label>margin<input type="text" class="styleoption_marign" value=""/></label></li>'
				+ '<li><label>padding<input type="text" class="styleoption_padding" value=""/></label></li>'
				+ '<li><label>style<input type="textarea" class="styleoption_style" value=""/></label></li>'
				+ '<li><label>title<input type="text" class="styleoption_title" value=""/></label></li>'
				+ '<li><label>type'
					+ '<select class="styleoption_type">'
						+ '<option value="v">竖向</option>'
						+ '<option value="h">横向</option>'
						+ '<option value="tab">选项卡</option>'
					+ '</select>'
					+ '</label></li>'
			+ '</ul>'
			+ '</div>')
};
//给view添加打开styleoption的按钮
mvcmerger.styleoption.optionbtn = function(view){
	var openbtn =jQuery("<div class='styleoption_open_btn'></div>");
	jQuery(view).append(openbtn);
	jQuery(view).hover(function(){
		openbtn.show(0);
	},function(){
		openbtn.hide(0);
	});
	openbtn.click(function(){
		mvcmerger.styleoption.open(openbtn);
	});
};
//打开菜单的方法
mvcmerger.styleoption.open = function(openbtn){
	var view = openbtn.parents('.org_jecat_framework_view:first');
	mvcmerger.styleoption.openedOptionDialog = mvcmerger.styleoption.optionDialog.clone();
	jQuery(view).append(mvcmerger.styleoption.openedOptionDialog);
	mvcmerger.styleoption.openedOptionDialog.dialog({
		buttons:{
			'取消':mvcmerger.styleoption.cancel
			, '确定':mvcmerger.styleoption.save
		}
		, width:400
		, height:300
		, closeText: 'hide'
		, closeOnEscape: true
		, show: 'slide'
	});
	
	//取得view的数据
	var arrViewData = ['class','width','height','marign','padding','style','title','type'];
	jQuery.each( arrViewData ,function(i,v){
		mvcmerger.styleoption.openedOptionDialog.find('.styleoption_'+v).val(view.data(v));
	});
	//特殊对待type数据??/////////////////////////////
	
	//保存事件
	mvcmerger.styleoption.save = function(){
		var arrViewData = ['class','width','height','marign','padding','style','title','type'];
		jQuery.each( arrViewData ,function(i,v){
			view.data( v , mvcmerger.styleoption.openedOptionDialog.find('.styleoption_'+ v).val() );
		});
		mvcmerger.styleoption.cancel();
	};
	//取消事件
	mvcmerger.styleoption.openedOptionDialog.find(".styleoption_cancel_btn").click(mvcmerger.styleoption.cancel);
	//在对话框以外的地方点击按照取消处理
//	jQuery('div').not(mvcmerger.styleoption.openedOptionDialog).click(function(){
//			mvcmerger.styleoption.cancel();
//	});
};
//关闭菜单的方法
mvcmerger.styleoption.cancel = function(){
	mvcmerger.styleoption.openedOptionDialog.remove();
	delete mvcmerger.styleoption.openedOptionDialog;
};
/* ----------------------------------- */

jquery(function(){

	// 初始化 view 
	jquery(".org_jecat_framework_view").each(function(idx,view){
		if( jquery(this).hasClass('org_jecat_framework_view-layout-frame') )
		{
			new mvcmerger.LayoutFrame(view) ;
		}
		else
		{
			var aMvcmergerView = new mvcmerger.View(view) ;
			//添加styleoption的打开按钮
			mvcmerger.styleoption.optionbtn(view);
		}
	}) ;
	
	// 操作界面
	jquery(document.body).append("<div id='mvc_merger-view_layout_setting_controlPanel' title='视图布局'><span id='mvc_merger-view_layout_setting_controlPanel_messages'></span></div>") ;
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
				jquery('#mvc_merger-view_layout_setting_controlPanel_messages').html('正在保存视图布局的配置 ... ...') ;
				
				jquery.ajax( '?c=org.opencomb.mvcmerger.merger.PostViewLayoutSetting&only_msg_queue=1&act=save',{
					data:{
						controller: currentControllerClass
						, config: JSON.stringify(mvcmerger.exportConfig())
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