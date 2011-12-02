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
		, start: function(event,ui) {
			
			jquery('#mvc_merger-layout-dropping-buttons-box').hide() ;
			
			// 已经有一个正在拖拽的视图
			if( mvcmerger.draggingView )
			{
				// 如果正在拖拽的视图不是自己，禁止拖拽
				// 否则允许继续拖拽，但是不重复记录拖拽前的状态
				return mvcmerger.draggingView.element==this ;
			}
			
			// 记录拖拽前的状态
			jquery(this).data('view').startDragging() ;
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
	jquery(newFrame).addClass('org_jecat_framework_view_layout_frame') ;
	jquery(newFrame).addClass('org_jecat_framework_view_layout_frame_'+type) ;
	jquery(newFrame).addClass('org_jecat_framework_view') ;
	jquery(newFrame).html('<div class="org_jecat_framework_view_layout_end" />') ;
	
	return new mvcmerger.LayoutFrame(newFrame) ;
}
mvcmerger.LayoutFrame.prototype.putin = function(view)
{
	jquery(this.element).find('>.org_jecat_framework_view_layout_end').before(view.element) ;
	view.autoFloat();
}
mvcmerger.LayoutFrame.prototype.isH = function()
{
	return mvcmerger.LayoutFrame.isH(this.element) ;
}
mvcmerger.LayoutFrame.isH = function(layoutElement)
{
	return jquery(layoutElement).hasClass('org_jecat_framework_view_layout_frame_h') ;
}

mvcmerger.LayoutFrame.clearAllInvalidLayoutFrame = function()
{
	jquery(".org_jecat_framework_view_layout_frame").each(function(){
		if( jquery(this).find('>.org_jecat_framework_view').size() <=1 )
		{
			// 见内部的子元素提上来
			jquery(this).find('>.org_jecat_framework_view').each(function(){
				jquery(this.parentNode).after(this) ;
				jquery(this).data('view').autoFloat();
			}) ;
			
			// 删除layout
			jquery(this).removeData('view') ;
			this.parentNode.removeChild(this) ;
		}
	}) ;
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