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
		console.log('mouseover '+this.id) ;
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
		, drag: function(event,ui) {
			jquery(this) ;
		}
	}) ;
	jquery(this.element).droppable({
		tolerance: 'pointer'
		//, hoverClass: 'mvc_merger-layout_settable_view_mouseover'
		, over: function(event,ui) {
			// 先把所有其它的视图 mouseover 效果移除
			jquery(".mvc_merger-layout_settable_view_mouseover").removeClass('mvc_merger-layout_settable_view_mouseover') ;
			jquery(this).addClass('mvc_merger-layout_settable_view_mouseover') ;
			
			console.log('dropping:over '+this.id) ;
		}
		, out: function(event,ui) {
			// 移除 mouseover 效果
			jquery(this).removeClass('mvc_merger-layout_settable_view_mouseover') ;
			
			console.log('dropping:out '+this.id) ;
		}
		, drop: function(event,ui) {

			// 对保留 mouseover 效果的元素进行操作
			mvcmerger.droppingToView = jquery('.mvc_merger-layout_settable_view_mouseover').data('view') ;
			
			console.log('drop '+mvcmerger.droppingToView.element.id) ;
			jquery('#mvc_merger-layout-dropping-buttons-box').css('left',event.originalEvent.pageX) ;
			jquery('#mvc_merger-layout-dropping-buttons-box').css('top',event.originalEvent.pageY) ;
			jquery('#mvc_merger-layout-dropping-buttons-box').show() ;
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
	jquery(newFrame).addClass('org_jecat_framework_view-layout-frame_'+type) ;
	jquery(newFrame).addClass('org_jecat_framework_view') ;
	jquery(newFrame).html('<div class="org_jecat_framework_view-layout-end" />') ;
	
	return new mvcmerger.LayoutFrame(newFrame) ;
}
mvcmerger.LayoutFrame.prototype.putin = function(view)
{
	jquery(this.element).find('>.org_jecat_framework_view-layout-end').before(view.element) ;
	view.autoFloat();
}
mvcmerger.LayoutFrame.prototype.isH = function()
{
	return mvcmerger.LayoutFrame.isH(this.element) ;
}
mvcmerger.LayoutFrame.isH = function(layoutElement)
{
	return jquery(layoutElement).hasClass('org_jecat_framework_view-layout-frame_h') ;
}

mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame = function()
{
	jquery(".org_jecat_framework_view-layout-frame").each(function(){
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

		config.push( mvcmerger.exportLayoutConfig(mvcmerger.View.obj(this)) ) ;
	}) ;
	
	return config ;
}
mvcmerger.exportLayoutConfig = function(layout)
{
	var config = { 
			class: 'frame'
			, id: layout.element.id
			, name: jquery(layout.element).attr('name') 
			, xpath: jquery(layout.element).data('xpath')
			, items:[]
	} ;
	
	jquery(layout.element).find('>.org_jecat_framework_view').each(function(){
		var obj = mvcmerger.View.obj(this) ;
		
		// 递归下级 layout
		if( obj instanceof mvcmerger.LayoutFrame )
		{
			config.items.push( mvcmerger.exportLayoutConfig(obj) ) ;
		}
		
		else
		{
			config.items.push({
				class: 'view'
				, id: this.id
				, name: jquery(this).attr('name') 
				, xpath: jquery(this).data('xpath')
			}) ;
		}
	}) ;
	
	return config ;
}

/* ----------------------------------- */

jquery(function(){

	// 初始化 view 
	jquery(".org_jecat_framework_view").each(function(idx,view){
		new mvcmerger.View(view) ;
	}) ;

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