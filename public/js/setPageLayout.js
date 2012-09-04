jQuery(function(){
	var i;
	var frame_selecter_item_container =
		jQuery('#frame_selecter')
		.find('.frame_selecter_item_container');
	var frame_selecter_item_list = 
		jQuery('#frame_selecter')
		.find('.frame_selecter_item_container > .box_frame_img')
		;
	var frame_selecter_item_insertBefore = 
		frame_selecter_item_container
		.find('.clr');
	for(i in pageLayoutData){
		var newFrameSelecterItem = jQuery(frame_selecter_item_list[0]).clone();
		// plid
		newFrameSelecterItem.find('a').attr('plid',i);
		// image
		newFrameSelecterItem.find('img').attr('src',pageLayoutData[i].image);
		// title
		newFrameSelecterItem.find('span').empty();
		newFrameSelecterItem.find('span').append(pageLayoutData[i].title);
		// onclick
		newFrameSelecterItem.find('a').bind('click',function(){
			var plid = jQuery(this).attr("plid");
			changePageLayout(plid);
			return false;
		});
		frame_selecter_item_insertBefore.before(newFrameSelecterItem);
	}
	frame_selecter_item_list.remove();
});

function getCustomFrameNodeList(){
	var customFrameNodeList =
	realThis.aZtree.getNodesByFilter(function(node){
		if( jQuery('#'+node.id).hasClass('cusframe') ){
			return true;
		}else{
			return false;
		}
	});
	return customFrameNodeList ;
}

function getViewContainerNode(){
	var viewContainerNode =
	realThis.aZtree.getNodesByFilter(function(node){
		if( __assembledParentId == node.id ){
			return true;
		}else{
			return false;
		}
	})[0];
	
	return viewContainerNode ;
}

function getParentNodeList(node){
	var list = [];
	do{
		list.push(node);
		node = node.getParentNode();
	}while( node != null );
	return list;
}

function getViewNodeList(){
	var viewContainerNode = getViewContainerNode();
	var vcParentNodeList = getParentNodeList(viewContainerNode);
	var viewNodeList = 
	realThis.aZtree.getNodesByFilter(function(node){
		if( node.type=='view' && vcParentNodeList.indexOf(node) == -1 ){
			return true;
		}else{
			return false;
		}
	});
	
	return viewNodeList ;
}

function recAddFrameByData(ele,node,data,parentData){
	if( typeof(data) != 'object' ) return [];
	if( typeof(parentData) == 'undefined' ){
		parentData = {} ;
	}
	
	var newframe = realThis.addChildFrame( ele , node )[0];
	
	var emptyFrameList = [] ;
	if( typeof( data['subframes'] ) != 'undefined' ){
		var i;
		// 先添加的在后面，因此需要反着循环
		for(i=data['subframes'].length-1;i>=0;i--){
			var rtn = recAddFrameByData(
				document.getElementById(newframe.id),
				newframe,
				data['subframes'][i],
				data
			);
			emptyFrameList = emptyFrameList.concat( rtn );
		}
	}else{
		data.node = newframe ;
		emptyFrameList.push( data );
	}
	
	if( typeof( data['dire'] ) != 'undefined' ){
		var eleNewf = document.getElementById( newframe.id );
		switch(data['dire']){
		case 'horizontal':
			realThis.setFrameLayout( eleNewf , 'h' );
			break;
		case 'vertical':
			realThis.setFrameLayout( eleNewf , 'v' );
			break;
		}
	}
	
	var aLayout = {};
	var i;
	for( i in parentData.layout ){
		aLayout[i] = parentData.layout[i] ;
	}
	for( i in data.layout ){
		aLayout[i] = data.layout[i] ;
	}
	realThis.setItemLayout( newframe , aLayout );
	
	return emptyFrameList ;
}

function changePageLayout(plid){
	var customFrameNodeList = getCustomFrameNodeList() ;
	
	var viewContainerNode = getViewContainerNode() ;
	var viewContainerEle = document.getElementById( __assembledParentId );
	
	var data = getPageLayoutData(plid);
	var newFrameList = recAddFrameByData( viewContainerEle , viewContainerNode , data );
	
	var viewNodeList = getViewNodeList();
	
	var i,j;
	
	var bssetMap = [];
	for(j in newFrameList){
		bssetMap[j] = j;
		newFrameList[j].num = 0;
		newFrameList[j].isFull = function(){
			if( typeof(this.nmax) == 'undefined' ){
				return false;
			}
			if( this.num < this.nmax ){
				return false;
			}
			return true;
		}
	}
	j = 0;
	for(i in viewNodeList){
		while( newFrameList[ bssetMap[j] ].isFull() ){
			bssetMap[j] ++ ;
			if( bssetMap[j] >= newFrameList.length ){
				bssetMap[j] = 0;
			}
		}
		
		var newframe = newFrameList[ bssetMap[j] ].node;
		var eleNewf = document.getElementById( newframe.id );
		newFrameList[ bssetMap[j] ].num ++ ;
		
		var eleView = document.getElementById(viewNodeList[i].id) ;
		realThis.aZtree.moveNode( newframe , viewNodeList[i] , 'inner' );
		realThis.updateLayout();
		realThis.moveIn( eleView , eleNewf );
		
		j++ ;
		if( j >= newFrameList.length ){
			j = 0;
		}
	}
	
	for( i in customFrameNodeList ){
		var cfn = customFrameNodeList[i];
		var ecf = document.getElementById(cfn.id);
		
		realThis.deleteFrame(ecf, cfn);
		//重新计算布局
		realThis.updateLayout();
	}
}

// dire : 方向，horizontal是水平，vertical是垂直
var pageLayoutData={
	'aaa':{
		'title':'左中右三栏，左右较窄',
		'dire':'horizontal',
		'subframes':[
			{
				'nmax':1,
				'dire':'vertical',
				'layout':{
					'width':200,
				}
			},
			{
				'dire':'vertical',
			},
			{
				'dire':'vertical',
				'nmax':2,
				'layout':{
					'width':100,
				},
			},
		],
	},
	'bbb':{
		'title':'测试',
	}
};

function getPageLayoutData(plid){
	return pageLayoutData[plid];
}
