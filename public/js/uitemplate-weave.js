//uibrowser
ub = {
	aTemplates:null,
	aDialog:jQuery(
		'<div id="ub_dialog" title="模板编织">'
			+ '<div id="ub_toolbox">'
				+ '<div id="ub_select_dom" class="toolBtns">'
				+ '</div>'
				+ '<div id="ub_select_tag" class="toolBtns">'
				+ '</div>'
			+ '</div>'
			+ '<div id="ub_left">'
				+ '<div id="ub_template_list">'
					+ '<ul>'
					+ '</ul>'
				+ '</div>'
			+ '</div>'
			+ '<div id="ub_right">'
				+ '<div id="ub_edit">'
					+ '<label>模板:<input id="ub_template" value="" disabled/></label></br>'
					+ '<label>位置:<input id="ub_xpath" value="" disabled/></label></br>'
					+ '<label>方式:<select id="ub_position">'
						+ '<option value="insertBefore">insertBefore</option>'
						+ '<option value="insertAfter">insertAfter</option>'
						+ '<option value="appendBefore">appendBefore</option>'
						+ '<option value="appendAfter">appendAfter</option>'
						+ '<option value="replace">replace</option>'
					+ '</select></label>'
					+ '<textarea id="ub_source"></textarea></br>'
					+ '<a id="ub_savebtn" href="#">织入</a>'
				+ '</div>'
				+ '<div id="ub_merge_list">'
					+ '<ul>'
					+ '</ul>'
				+ '</div>'
			+ '</div>'
		+ '</div>'	
	),
	aViewbtns:jQuery(
		'<div id="viewbtns">'
			+ '<a id="showTag" href="#">显</a>'
		+ '</div>'
	),
	//初始化
	init:function(){
		//加载模板信息
		ub.getUiTemplates();
		ub.openDialog();
		ub.initTagList();
		ub.bindEvent();
	},
	//获得模板结构信息
	getUiTemplates:function(){
		if(typeof(__uitemplates) == 'object'){
			ub.aTemplates = __uitemplates;
		}else{
			ub.log("we have no '__uitemplates' to use");
		}
	},
	openDialog:function(){
		ub.aDialog.dialog({
			width:900
			, height:500
			, closeOnEscape: true
			, show: 'slide'
		});
	},
	//************初始化tag列表************
	initTagList:function(){
		jQuery.each(ub.aTemplates ,function(sKey,aTemplate){
			var arrKeys = sKey.split(':');
			var templateName = sKey;
			if(arrKeys.length == 2){
				templateName = arrKeys[1]+"("+arrKeys[0]+")";
			}
			var aLi = jQuery("<li><span>"+templateName+"</span></li>");
			aLi.append(ub.initChildrenTagList(aTemplate['children']));
			jQuery("#ub_template_list>ul").append(aLi);
		});
		jQuery("#ub_template_list>ul").treeview({collapsed: true});
	},
	initChildrenTagList:function(aTags){
		if(aTags.length <= 0){
			return;
		}
		var aUl = jQuery("<ul></ul>");
		jQuery.each(aTags,function(nKey,aTag){
			var aLi = jQuery("<li><span>&lt;"+aTag['tag']+"&gt;</span></li>");
			aLi.append(ub.initChildrenTagList(aTag['children']));
			aUl.append(aLi.attr('tagxpath',aTag['xpath']).data("data",aTag));
		});
		return aUl;
	},
	//************end 初始化tag列表************
	
	//**************选择tag列表中的元素**************
	selectTag:function(e){
		ub.highLightSelect(jQuery(this));
		ub.sentTagInfoToEditForm(jQuery(this));
		e.stopPropagation();
	},
	highLightSelect:function(tag){
		jQuery('#ub_template_list ul,#ub_template_list li').removeClass("selectTag");
		jQuery(tag).addClass("selectTag");
	},
	//**************end 选择tag列表中的元素********
	
	//**************点中tag后 编辑属性**************
	sentTagInfoToEditForm:function(tag){
		jQuery('#ub_template').val(tag.parents("li:last").find("span:first").text());
		jQuery('#ub_xpath').val(tag.data("data")['xpath']);
	},
	clearEditForm:function(){
		jQuery('#ub_edit').find('input textarea').val('');
	},
	//**************end 点中tag后 编辑属性**************
	
	//绑定事件
	bindEvent:function(){
		//选择标签
		jQuery('#ub_template_list>ul>li').find("ul , li").click(ub.selectTag);
		
		//选取dom模式开关
		jQuery("#ub_select_dom").click(function(){
			if(jQuery(this).hasClass("toolBtnSelect")){
				ub.closeSelectDomMode();
			}else{
				ub.openSelectDomMode();
			}
		});
	},
	
	//*********选择dom模式**********
	openSelectDomMode:function(){
		jQuery("#ub_select_dom").addClass("toolBtnSelect");
		//绑定选择dom的方法
		jQuery('body').on("mouseover","*[xpath]",ub.highLightDom);
		jQuery('body').on("mouseout","*[xpath]",ub.lowLightDom);
		jQuery('body').on("click","*[xpath]",ub.selectDomAndFindTag);
	},
	closeSelectDomMode:function(){
		jQuery("#ub_select_dom").removeClass("toolBtnSelect");
		//卸载选择dom的方法
		jQuery('body').off("mouseover","*[xpath]",ub.highLightDom);
		jQuery('body').off("mouseout","*[xpath]",ub.lowLightDom);
		jQuery('body').off("click","*[xpath]",ub.selectDomAndFindTag);
	},
	selectDomAndFindTag:function(e){
		var dom = jQuery(e.target);
		dom.removeClass("highlight");
		var xpath = dom.attr("xpath");
		var treeview = jQuery("#ub_template_list .treeview");
		//收起已经展开的tag
		ub.closeTree();
		//需要显示的节点
		var target = treeview.find("li[tagxpath='"+xpath+"']").first();
		//展开父节点
		target.parents('.expandable').find("span:first").click();
		//选中目标节点
		target.click();
		//滚动到用户可见
		ub.scrollToSee(target,jQuery("#ub_left"));
		//关闭选择模式
		ub.closeSelectDomMode();
		e.stopPropagation();
		return false;
	},
	scrollToSee:function(dom,container){
		var toHeight = 100; //把目标拉到30像素的位置,方便查看
		container.scrollTop(dom.position().top-toHeight);
	},
	highLightDom:function(e){
		var dom = jQuery(e.target);
		dom.addClass("highlight");
		e.stopPropagation();
	},
	lowLightDom:function(e){
		var dom = jQuery(e.target);
		dom.removeClass("highlight");
		e.stopPropagation();
	},
	closeTree:function(){
		jQuery("#ub_collapseAll").click();
		jQuery("#ub_treecontrol ul").css({display:"none"});
	},
	//*********end 选择dom模式**********
	
	//调试
	log:function(message){
		if(typeof(console) == 'object'){
			console.log(message);
		}
	}
};
jQuery(function(){
	ub.init();
});