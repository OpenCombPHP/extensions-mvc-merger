//uibrowser
ub = {
	aTemplates:null,
	aDialog:jQuery(
		'<div id="ub_dialog" title="模板编织">'
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
			, closeText: 'hide'
			, closeOnEscape: true
			, show: 'slide'
		});
	},
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
			aUl.append(aLi.data("data",aTag));
		});
		return aUl;
	},
	highLightDom:function(dom){
		dom.addClass("highlight");
		setTimeout(function(){dom.removeClass("highlight");},3000);
	},
	highLightTag:function(tag){
		tag.addClass("highlight");
		setTimeout(function(){tag.removeClass("highlight");},3000);
	},
	highLightSelect:function(tag){
		jQuery('#ub_template_list ul,#ub_template_list li').removeClass("selectTag");
		jQuery(tag).addClass("selectTag");
	},
	sentTagInfoToEditForm:function(tag){
		jQuery('#ub_template').val(tag.parents("li:last").find("span").text());
		jQuery('#ub_xpath').val(tag.data("data")['xpath']);
	},
	clearEditForm:function(){
		jQuery('#ub_edit').find('input textarea').val('');
	},
	bindEvent:function(){
		//选择标签
		jQuery('#ub_template_list>ul>li').find("ul , li").click(ub.selectTag);
	},
	selectTag:function(e){
		ub.highLightSelect(jQuery(this));
		ub.sentTagInfoToEditForm(jQuery(this));
		e.stopPropagation();
	},
	log:function(message){
		if(typeof(console) == 'object'){
			console.log(message);
		}
	}
};
jQuery(function(){
	ub.init();
});