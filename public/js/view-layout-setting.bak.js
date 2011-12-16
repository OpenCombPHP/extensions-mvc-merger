mvcmerger.propertiesDialog = {
	optionDialog:jQuery('<div class="propertiesDialog" title="视图属性">'
			+ '<ul>'
				+ '<li><label title="class">css类<input type="text" class="propertiesDialog_class" value=""/></label></li>'
				+ '<li><label title="width">宽度<input type="text" class="propertiesDialog_width" value=""/></label></li>'
				+ '<li><label title="height">高度<input type="text" class="propertiesDialog_height" value=""/></label></li>'
				+ '<li><label title="margin">外边距<input type="text" class="propertiesDialog_margin_u" title="外边距:上"/></label>'
					+ '<input type="text" class="propertiesDialog_margin_r" title="外边距:右"/>'
					+ '<input type="text" class="propertiesDialog_margin_b" title="外边距:下"/>'
					+ '<input type="text" class="propertiesDialog_margin_l" title="外边距:左"/>'
				+ '</li>'
				+ '<li><label title="padding">内边距<input type="text" class="propertiesDialog_padding_u" title="内边距:上"/></label>'
					+ '<input type="text" class="propertiesDialog_padding_r" title="内边距:右"/>'
					+ '<input type="text" class="propertiesDialog_padding_b" title="内边距:下"/>'
					+ '<input type="text" class="propertiesDialog_padding_l" title="内边距:左"/>'
				+ '</li>'
				+ '<li><label title="border">边框</label><br/>'
					+ '<label title="border-top">上<select class="propertiesDialog_border_type_top">'
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
					+ '<input type="text" class="propertiesDialog_border_top" title="宽度:上"/>'
					+ '<input type="text" class="propertiesDialog_border_color_top" title="颜色:上"/><br/>'
					
					+ '<label title="border-bottom">下<select class="propertiesDialog_border_type_bottom">'
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
					+ '<input type="text" class="propertiesDialog_border_bottom" title="宽度:下"/>'
					+ '<input type="text" class="propertiesDialog_border_color_bottom" title="颜色:下"/><br/>'
					
					+ '<label title="border-left">左<select class="propertiesDialog_border_type_left">'
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
					+ '<input type="text" class="propertiesDialog_border_left" title="宽度:左"/>'
					+ '<input type="text" class="propertiesDialog_border_color_left" title="颜色:左"/><br/>'
					
					+ '<label title="border-right">右<select class="propertiesDialog_border_type_right">'
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
					+ '<input type="text" class="propertiesDialog_border_right" title="宽度:右"/>'
					+ '<input type="text" class="propertiesDialog_border_color_right" title="颜色:右"/><br/>'
				+ '</li>'
				+ '<li><label title="background">背景</label><br/>'
				+ '<label title="background-img">背景图路径<input class="propertiesDialog_background_img"/></label><br/>'
				+ '<label title="background-color">背景颜色<input class="propertiesDialog_background_color"/></label><br/>'
				+ '<label title="background-position">偏移<input class="propertiesDialog_background_position"/></label><br/>'
				+ '<label title="background-repeat">重复<select class="propertiesDialog_repeat">'
					+ '<option value="repeat">repeat</option>'
					+ '<option value="no-repeat">no-repeat</option>'
					+ '<option value="repeat-x">repeat-x</option>'
					+ '<option value="repeat-y">repeat-y</option>'
					+ '<option value="inherit">inherit</option>'
				+ '</select></label></li>'
				+ '<li><label title="style">样式<textarea class="propertiesDialog_style"/></label></li>'
				+ '<li><label title="title">标题<input type="text" class="propertiesDialog_title"/></label></li>'
				+ '<li><label title="layout-type">布局类型'
					+ '<select class="propertiesDialog_type">'
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
//给view添加打开propertiesDialog的按钮
mvcmerger.propertiesDialog.optionbtn = function(view){
	view.hover(function(e){
		var openbtns =jQuery("<div class='optionBtnsContainer'></div>");
		view.append(openbtns);
		mvcmerger.propertiesDialog.buildParentOptionbtns(view,openbtns);
	},function(e){
		view.find(".optionBtnsContainer").remove();
	});
};



//打开菜单的方法
mvcmerger.propertiesDialog.open = function(openbtn){
	var view = openbtn.data("frame");
	//表单唯一
	if(jQuery.type(mvcmerger.propertiesDialog.openedOptionDialog) == 'object'){
		mvcmerger.propertiesDialog.openedOptionDialog.remove();
	}
	
	mvcmerger.propertiesDialog.openedOptionDialog = mvcmerger.propertiesDialog.optionDialog.clone();
	
	//是横向layout还是纵向,还是tab?也可能哪个也不是:all false
	var isH = view.hasClass('jc-view-layout-frame-horizontal') ? true : null;
	var isV = view.hasClass('jc-view-layout-frame-vertical') ? true : null;
	var isT = view.hasClass('jc-view-layout-frame-tab') ? true : null;
	
	//只有layout才有type属性
	if(!isH  && !isV && !isT){
		mvcmerger.propertiesDialog.openedOptionDialog.find('.propertiesDialog_type').closest('li').remove();
	}
	
	view.append(mvcmerger.propertiesDialog.openedOptionDialog);
	
	//保存事件
	mvcmerger.propertiesDialog.save = function(){
		var style  = {};
		if(jQuery.type(view.data("properties")) != "object"){
			view.data("properties",{});
		}else{
			style = view.data("properties");
		}
		var inputAndSelect = mvcmerger.propertiesDialog.openedOptionDialog.find("select,input,textarea");
		inputAndSelect.each(function(index){
			if(jQuery(this).hasClass("propertiesDialog_border_type_top")
					|| jQuery(this).hasClass("propertiesDialog_border_type_right")
					|| jQuery(this).hasClass("propertiesDialog_border_type_bottom")
					|| jQuery(this).hasClass("propertiesDialog_border_type_left")){
				if(jQuery(this).val() != "none"){
					style[jQuery(this).attr("class")] = jQuery(this).val();
				}
			}else if(jQuery(this).hasClass("propertiesDialog_repeat")){
				if(jQuery(this).val() != "repeat"){
					style[jQuery(this).attr("class")] = jQuery.trim(jQuery(this).val());
				}
			}else if(jQuery.trim(jQuery(this).val()) != ""){
				style[jQuery(this).attr("class")] = jQuery.trim(jQuery(this).val());
			}
		});
		view.data( "properties" , style);
		view.data( "attributes" , mvcmerger.getAttributes(view));
		view.attr( "style" , view.data( "attributes" )['style']);//view.attr("style")+view.data( "attributes" )['style']);
	};
	mvcmerger.propertiesDialog.openedOptionDialog.find("select,input,textarea").change(mvcmerger.propertiesDialog.save);
	
	//重置属性的方法
	mvcmerger.propertiesDialog.reset = function(vv,bb){
		console.log(vv);
		
		view.data("properties",view.data( "origin_properties" ));
		var inputAndSelect = mvcmerger.propertiesDialog.openedOptionDialog.find("select,input,textarea");
		var styleForFrame = view.data("properties");
		if(styleForFrame){
			inputAndSelect.each(function(index){
				jQuery(this).val(styleForFrame[jQuery(this).attr("class")]);
			});
		}
		mvcmerger.propertiesDialog.save();
	};

	//关闭菜单的方法
	mvcmerger.propertiesDialog.cancel = function(){
		mvcmerger.propertiesDialog.openedOptionDialog.remove();
		delete mvcmerger.propertiesDialog.openedOptionDialog;
	};
	
//	mvcmerger.propertiesDialog.openedOptionDialog.dialog({
//		buttons:{
//			'还原':function(event){
//				mvcmerger.propertiesDialog.reset(event);
//			} ,
//			'关闭':mvcmerger.propertiesDialog.cancel
//		}
//		, width:400
//		, height:600
//		, closeText: 'hide'
//		, closeOnEscape: true
//		, show: 'slide'
//	});
	
	//体现layout 的type类型到.propertiesDialog_type中
	if(isH && !view.data('type')){
		view.data("type","h");
	}else if(isV && !view.data('type')){
		view.data("type","v");
	}else if(isT && !view.data('type')){
		view.data("type","tab");
	}
	
	//取得view的数据(还原表单)
	var inputAndSelect = mvcmerger.propertiesDialog.openedOptionDialog.find("select,input,textarea");
	if(view.data("layout-properties")){
		view.data("properties",view.data("layout-properties")['properties']);
		//备份原始数据,提供还原功能
		view.data("origin_properties",view.data("layout-properties")['properties']);
		//经过数据还原的表单不再依赖原始数据,为了节省内存而清理
		view.removeData("layout-properties");
	}
	var styleForFrame = view.data("properties");
	if(styleForFrame){
		inputAndSelect.each(function(index){
			jQuery(this).val(styleForFrame[jQuery(this).attr("class")]);
		});
	}
};
