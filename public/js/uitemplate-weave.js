//uibrowser
ub = {
	aRunningZTree:null,
	aTemplates:null,
	aDialog:jQuery(
		'<div id="ub_dialog" title="模板编织">'
			+ '<div id="ub_toolbox">'
				+ '<div id="ub_select_dom" class="toolBtns">'
				+ '</div>'
			+ '</div>'
			+ '<div id="ub_left">'
				+ '<div id="ub_template_list" class="ztree">'
				+ '</div>'
			+ '</div>'
			+ '<div id="ub_right">'
				+ '<div id="tabs">'
					+ '<ul>'
						+ '<li><a href="#tabs-1">编织模板</a></li>'
						+ '<li><a href="#tabs-2">补丁设置</a></li>'
					+ '</ul>'
					+ '<div id="tabs-1">'
						+ '<div id="ub_edit">'
							+ '<label>在右边的模板结构中选择“编织目标”</label></br>'
							+ '<label>目标模板:<input id="ub_template" value="" disabled/></label></br>'
							+ '<label>目标位置:<input id="ub_xpath" value="" disabled/></label></br>'
							+ '<label>织入方式:<select id="ub_position">'
								+ '<option value="appendBefore">目标前面(appendBefore)</option>'
								+ '<option value="appendAfter">目标后面(appendAfter)</option>'
								+ '<option value="insertBefore">目标内部开头(insertBefore)</option>'
								+ '<option value="insertAfter">目标内部结尾(insertAfter)</option>'
								+ '<option value="replace">替换目标(replace)</option>'
							+ '</select></label>'
							+ '<textarea id="ub_source"></textarea></br>'
							+ '<div id="ub_save_message" href="#"></div>'
							+ '<button id="ub_savebtn" onclick="ub.saveSetting()">织入代码</button>'
						+ '</div>'
					+ '</div>'
					+ '<div id="tabs-2">'
						+ '<div id="ub_merge_list">'
							+ '<img src="extensions/mvc-merger/0.1/public/image/loading.gif" width=250 height=180>'
						+ '</div>'
					+ '</div>'
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
			, closeOnEscape: true
			, show: 'slide'
		});
		jQuery( "#tabs" ).tabs({ selected: 0});
	},
	//************初始化tag列表************
	initTagList:function(){
		var arrZtreeData = [];
		jQuery.each(ub.aTemplates ,function(sKey,aTemplate){
			var arrKeys = sKey.split(':');
			
			//TODO 这里隐藏了织入的模板,应该显示出来让用户有递归编织的机会,但是目前没有完成
			if(arrKeys[1] == ''){
				return;
			}
			
			var templateName = sKey;
			if(arrKeys.length == 2){
				templateName = "模板：" + arrKeys[1] + "(" + arrKeys[0] + ")" ;
			}
			var aTreeTop = {name: templateName, children: []};
			arrZtreeData.push(aTreeTop);
			aTreeTop['children'] = ub.initChildrenTagList(aTemplate['children']) ;
			aTreeTop['templateNameAndNameSpace'] = sKey ;
		});
		//初始化树
		jQuery.fn.zTree.init(jQuery("#ub_template_list"), {
			view: {
				addHoverDom : ub.addHoverDom ,
				removeHoverDom : ub.removeHoverDom ,
				expandSpeed : 0
			},
			callback: {
				onClick: ub.selectTag
			}
		}, arrZtreeData);
		ub.aRunningZTree = jQuery.fn.zTree.getZTreeObj("ub_template_list");
	},
	initChildrenTagList:function(aTags){
		if(aTags.length <= 0){
			return;
		}
		var arrChildren = [];
		jQuery.each(aTags,function(nKey,aTag){
			var aLi = {name: "<"+aTag['tag']+">" , children:[]};
			aLi['children'] = ub.initChildrenTagList(aTag['children']);
			aLi['tagxpath'] = aTag['xpath'];
			aLi['data'] = aTag;
			arrChildren.push(aLi);
		});
		return arrChildren;
	},
	//************end 初始化tag列表************
	
	//**************选择tag列表中的元素**************
	selectTag:function(event, treeId, treeNode){
		if(!treeNode.getParentNode()){
			return;
		}
		ub.sentTagInfoToEditForm(treeNode);
		event.stopPropagation();
	},
	//**************end 选择tag列表中的元素********
	
	//**************点中tag后 编辑属性**************
	sentTagInfoToEditForm:function(treeNode){
		ub.clearEditForm();
		var parentNode = ub.getTopNode(treeNode);
		jQuery('#ub_template').val(parentNode.templateNameAndNameSpace);
		jQuery('#ub_xpath').val(treeNode.data.xpath);
	},
	clearEditForm:function(){
		jQuery('#ub_edit').find('input,textarea').val('');
	},
	getTopNode:function(treeNode){
		var parentNode = treeNode.getParentNode();
		do{
			parentNodeTemp = parentNode.getParentNode();
			if(!parentNodeTemp){
				break;
			}else{
				parentNode = parentNodeTemp;
			}
		}while(true);
	},
	//**************end 点中tag后 编辑属性**************
	
	//绑定事件
	bindEvent:function(){
		//选取dom模式开关
		jQuery("#ub_select_dom").click(function(){
			if(jQuery(this).hasClass("toolBtnSelect")){
				ub.closeSelectDomMode();
			}else{
				ub.openSelectDomMode();
			}
		});
	},
	addHoverDom:function(treeId, treeNode){
		if(!treeNode.getParentNode()){
			return;
		}
		var aObj = jQuery("#" + treeNode.tId);
		if (jQuery("#showDom_"+treeNode.tId).length>0) return;
		var editStr = "<button type='button' id='showDom_" +treeNode.tId
						+ "' title='编织模板' onfocus='this.blur();' style= 'margin-right:2px; background: url(/extensions/mvc-merger/0.1/public/image/patch.png) no-repeat scroll 0 0 transparent; vertical-align:top; *vertical-align:middle' ></button>"
						+ "<button type='button' id='showConf_" +treeNode.tId
						+ "' title='显示DOM节点' onfocus='this.blur();' style= 'margin-right:2px; background: url(/extensions/mvc-merger/0.1/public/image/point.png) no-repeat scroll 0 0 transparent; vertical-align:top; *vertical-align:middle' ></button>";
		aObj.find('>a').after(editStr);
		jQuery("#showDom_"+treeNode.tId).on("click", function(){
			//切换tab
			jQuery( "#tabs" ).tabs( "select" , 1);
			var parentNode = ub.getTopNode(treeNode);
			var templateNamespace = parentNode.templateNameAndNameSpace;
			var xpath = treeNode.data.xpath;
			//个tab页面填充信息
			console.log("namespace::"+tempalteNamespace);
			console.log("xpath::"+xpath);
			jQuery.ajax( {
				uil: '?c=org.opencomb.mvcmerger.merger.TemplateWeaveList'
				, data:{namespace:templateNamespace , xpath : xpath}
				, type: 'POST'
				, complete: function(jqXHR, textStatus){
					if(textStatus=='success')
					{
						jquery('#ub_save_message').html(jqXHR.responseText) ;
					}
					else
					{
						jquery('#ub_save_message').html('保存操作遇到网络错误。') ;
					}
				}
			});
		});
		jQuery("#showConf_"+treeNode.tId).on("click", function(){
			ub.highLightDomForSec(treeNode,4);
		});
	},
	removeHoverDom:function(treeId, treeNode){
		jQuery("#showDom_"+treeNode.tId).off().remove();
		jQuery("#showConf_"+treeNode.tId).off().remove();
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
		//收起已经展开的tag
		ub.closeTree();
		//需要显示的节点
		var target = ub.aRunningZTree.getNodesByParamFuzzy("tagxpath" , xpath , null);
		//展开父节点
		ub.aRunningZTree.expandNode(target[0],true,false,true);
		//选中目标节点
		ub.aRunningZTree.selectNode(target[0]);
		//关闭选择模式
		ub.closeSelectDomMode();
		e.stopPropagation();
		return false;
	},
	scrollToSeeTag:function(dom,container){
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
		ub.aRunningZTree.expandAll(false);
	},
	//*********end 选择dom模式**********
	
	//*********选择tag按钮**********
	addTagToolBtns:function(tag){
		tag.append(ub.aTagToolBtns.show(0).css({
			top:tag.position().top //和tag同高
			,left:(tag.position().left+tag.width()-ub.aTagToolBtns.width()-40)  //在tag尾部显示
		}));
	},
	removeTagToolBtns:function(){
		ub.aTagToolBtns.hide(0);
	},
	scrollToSeeDom:function(dom,container){
		var toHeight = 100; //把目标拉到30像素的位置,方便查看
		container.scrollTop(dom.position().top-toHeight);
	},
	highLightDomForSec:function(tag,sec){
		var dom = jQuery("*[xpath='"+tag.tagxpath+"']");
		dom.addClass("highlight");
		setTimeout(function(){dom.removeClass("highlight")} , sec*1000);
	},
	saveSetting:function() {
		jquery('#ub_save_message').html('正在保存 ... ...') ;
		
		jquery.ajax( '?c=org.opencomb.mvcmerger.merger.PostTemplateWeave&only_msg_queue=1&act=save',{
			data: {
				template: jquery('#ub_template').val()
				, xpath: jquery('#ub_xpath').val()
				, position: jquery('#ub_position').val()
				, source: jquery('#ub_source').val()
			}
			, type: 'POST'
			, complete: function(jqXHR, textStatus){
				if(textStatus=='success')
				{
					jquery('#ub_save_message').html(jqXHR.responseText) ;
				}
				else
				{
					jquery('#ub_save_message').html('保存操作遇到网络错误。') ;
				}
			}
		} ) ;
	},
	//*********end 选择tag按钮**********
	
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